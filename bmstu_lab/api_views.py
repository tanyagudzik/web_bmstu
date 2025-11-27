from django.db import transaction
from django.utils.timezone import now
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import random

from .models import SupportService, SupportRequest, SupportRequestService
from .serializers import SupportServiceSerializer, SupportRequestSerializer
from .utils import get_current_user # пока не используем

# ------------------ ДОМЕН УСЛУГ ------------------

@api_view(['GET'])
def support_services_api(request):
    """GET список услуг с фильтром ?q= ; удалённые и неактивные не отдаём."""
    q = (request.GET.get('q') or '').strip()
    qs = SupportService.objects.filter(is_active=True, is_deleted=False)
    if q:
        qs = qs.filter(title__icontains=q)
    return Response(SupportServiceSerializer(qs, many=True).data)

@api_view(['GET'])
def support_service_api(request, service_id: int):
    """GET одна услуга."""
    try:
        s = SupportService.objects.get(pk=service_id, is_active=True, is_deleted=False)
    except SupportService.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)
    return Response(SupportServiceSerializer(s).data)

@api_view(['POST'])
def support_service_add_to_request_api(request, service_id: int):
    """POST добавление услуги в текущую заявку-черновик."""
    # NO-AUTH: user = get_current_user()
    try:
        service = SupportService.objects.get(pk=service_id, is_active=True, is_deleted=False)
    except SupportService.DoesNotExist:
        return Response({'detail': 'service not found'}, status=404)

    with transaction.atomic():
        draft, _ = SupportRequest.objects.get_or_create(
            requester=None,   # черновик без пользователя NO-AUTH: user
            status=SupportRequest.Status.DRAFT,
            is_deleted=False,
            defaults={'created_at': now()}
        )
        SupportRequestService.objects.create(
            support_service=service,
            support_requests=draft,
            qty=1,           # qty храним, но в UI не показываем
            amount=None,     # сумма по ЛР-3 не требуется в UI
            comment=''
        )
    return Response({'request_id': draft.id}, status=status.HTTP_201_CREATED)

# ------------------ ДОМЕН ЗАЯВКИ ------------------

@api_view(['GET'])
def support_request_cart_api(request):
    """
    GET иконки корзины (без входных параметров):
    возвращает id черновика и количество услуг в нём.
    """
    # NO-AUTH: user = get_current_user()
    draft = SupportRequest.objects.filter(
        requester=None,   # черновик без пользователя NO-AUTH: user
        status=SupportRequest.Status.DRAFT,
        is_deleted=False
    ).first()
    if not draft:
        return Response({'request_id': None, 'count': 0})
    count = SupportRequestService.objects.filter(support_requests=draft).count()
    return Response({'request_id': draft.id, 'count': count})

@api_view(['GET'])
def support_request_api(request, rid: int):
    """GET одна заявка (+ её услуги). Удалённые не возвращаем."""
    # user = get_current_user()
    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False) # + requester=user
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)
    return Response(SupportRequestSerializer(req).data)

@api_view(['PUT'])
def support_request_form_api(request, rid: int):
    """
    PUT сформировать заявку (создатель = фиксированный пользователь).
    Ставит статус 'formed' и requested_at.
    """
    # user = get_current_user()
    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False) # + requester=user
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    if req.status != SupportRequest.Status.DRAFT:
        return Response({'detail': 'only draft can be formed'}, status=400)

    req.status = SupportRequest.Status.FORMED
    req.requested_at = now()
    req.save(update_fields=['status', 'requested_at'])
    return Response({'status': 'formed', 'requested_at': req.requested_at})

@api_view(['PUT'])
def support_request_finish_api(request, rid: int):
    """
    PUT завершить заявку (модератором).
    'результат' это случайная галочка в М-М.
    """
    # user = get_current_user()
    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False) # + requester=user
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    if req.status != SupportRequest.Status.FORMED:
        return Response({'detail': 'only formed can be finished'}, status=400)

    with transaction.atomic():
        lines = SupportRequestService.objects.filter(support_requests=req)
        for ln in lines:
            ln.ok = random.choice([True, False])
            ln.save(update_fields=['ok'])
        req.status = SupportRequest.Status.FINISHED
        req.finished_at = now()
        req.save(update_fields=['status', 'finished_at'])
    return Response({'status': 'finished', 'finished_at': req.finished_at})

@api_view(['PUT'])
def support_request_reject_api(request, rid: int):
    """PUT отклонить заявку (модератором)."""
   # user = get_current_user()
    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False) # + requester=user
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    if req.status != SupportRequest.Status.FORMED:
        return Response({'detail': 'only formed can be rejected'}, status=400)

    req.status = SupportRequest.Status.REJECTED
    req.finished_at = now()
    req.save(update_fields=['status', 'finished_at'])
    return Response({'status': 'rejected', 'finished_at': req.finished_at})

@api_view(['DELETE'])
def support_request_delete_api(request, rid: int):
    """DELETE логическое удаление черновика."""
    # user = get_current_user()
    updated = (SupportRequest.objects
               .filter(id=rid, status=SupportRequest.Status.DRAFT, is_deleted=False) # + requester=user
               .update(is_deleted=True, deleted_at=now(), status=SupportRequest.Status.DELETED))
    if not updated:
        return Response({'detail': 'not allowed or not found'}, status=400)
    return Response(status=204)

# ------------------ ДОМЕН М-М (строки заявки) ------------------

@api_view(['DELETE'])
def support_request_line_delete_api(request, rid: int, line_id: int):
    """DELETE строку из заявки (без удаления самой заявки)."""
    # user = get_current_user()
    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False) # + requester=user
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)
    deleted, _ = SupportRequestService.objects.filter(id=line_id, support_requests=rid).delete()
    return Response(status=204 if deleted else 404)

@api_view(['PUT'])
def support_request_line_update_api(request, rid: int, line_id: int):
    """
    PUT изменить значения в М-М: по замечанию оставляем comment.
    """
    # user = get_current_user()
    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False) # + requester=user
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    try:
        line = SupportRequestService.objects.get(id=line_id, support_requests=req)
    except SupportRequestService.DoesNotExist:
        return Response({'detail': 'line not found'}, status=404)

    comment = (request.data.get('comment') or '').strip()
    line.comment = comment
    line.save(update_fields=['comment'])
    return Response({'id': line.id, 'comment': line.comment})
