from django.db import transaction
from django.utils.timezone import now
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema

import random

from .models import SupportService, SupportRequest, SupportRequestService
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    SupportServiceSerializer,
    SupportRequestSerializer,
)

from .serializers import ServiceImageSerializer
from django.views.decorators.csrf import csrf_exempt
from .utils import create_session, delete_session, get_user_by_session_id


User = get_user_model()

@swagger_auto_schema(method='post', request_body=RegisterSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def register_user_api(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@swagger_auto_schema(method='post', request_body=LoginSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login_api(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'detail': 'email and password required'}, status=400)

    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response({'detail': 'invalid credentials'}, status=400)
    if not user.is_active:
        return Response({'detail': 'user is inactive'}, status=400)

    # РУЧНАЯ СЕССИЯ: uuid -> email в Redis, cookie session_id
    sid = create_session(user.get_username())

    resp = Response({'detail': 'logged in'}, status=200)
    resp.set_cookie("session_id", sid)
    return resp

@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def logout_api(request):
    session_id = request.COOKIES.get("session_id")
    if session_id:
        delete_session(session_id)

    resp = Response({'detail': 'logged out'}, status=200)
    resp.delete_cookie("session_id")
    return resp


def require_user(request):
    """
    Проверка авторизации по cookie session_id и Redis.
    Возвращает (user, None) или (None, Response).
    """
    session_id = request.COOKIES.get("session_id")
    if not session_id:
        return None, Response({"detail": "not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

    user = get_user_by_session_id(session_id)
    if not user:
        return None, Response({"detail": "invalid session"}, status=status.HTTP_401_UNAUTHORIZED)

    return user, None


def is_manager(user) -> bool:
    return bool(user and (user.is_staff or user.is_superuser))

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
@authentication_classes([])
@permission_classes([AllowAny])
def support_service_add_to_request_api(request, service_id: int):
    """POST добавление услуги в текущую заявку-черновик."""
    user, err = require_user(request)
    if err:
        return err
    try:
        service = SupportService.objects.get(pk=service_id, is_active=True, is_deleted=False)
    except SupportService.DoesNotExist:
        return Response({'detail': 'service not found'}, status=404)

    with transaction.atomic():
        draft, _ = SupportRequest.objects.get_or_create(
            requester=user,
            status=SupportRequest.Status.DRAFT,
            is_deleted=False,
            defaults={'created_at': now()},
        )
        SupportRequestService.objects.get_or_create(
            support_service=service,
            support_requests=draft,
            defaults={'qty': 1, 'amount': None, 'comment': ''},
        )

    return Response({'request_id': draft.id}, status=status.HTTP_201_CREATED)

@swagger_auto_schema(method='post', request_body=SupportServiceSerializer)
@api_view(['POST'])
def support_service_create_api(request):
    user, err = require_user(request)
    if err:
        return err
    if not is_manager(user):
        return Response({'detail': 'forbidden'}, status=403)

    serializer = SupportServiceSerializer(data=request.data)
    if serializer.is_valid():
        service = serializer.save()
        return Response(SupportServiceSerializer(service).data,
                        status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(method='put', request_body=ServiceImageSerializer)
@api_view(['PUT'])
def support_service_upload_image_api(request, service_id: int):
    user, err = require_user(request)
    if err:
        return err
    if not is_manager(user):
        return Response({'detail': 'forbidden'}, status=403)

    try:
        service = SupportService.objects.get(
            pk=service_id,
            is_active=True,
            is_deleted=False
        )
    except SupportService.DoesNotExist:
        return Response({'detail': 'service not found'}, status=404)

    img_url = (request.data.get('img_url') or '').strip()
    if not img_url:
        return Response({'detail': 'img_url is required'}, status=400)

    service.img_url = img_url
    service.save(update_fields=['img_url'])

    return Response(
        {'id': service.id, 'title': service.title, 'img_url': service.img_url},
        status=status.HTTP_200_OK
    )

# ------------------ ДОМЕН ЗАЯВКИ ------------------

@api_view(['GET'])
def support_request_cart_api(request):
    """
    GET иконки корзины (без входных параметров):
    возвращает id черновика и количество услуг в нём.
    """
    user, err = require_user(request)
    if err:
        return err

    draft = SupportRequest.objects.filter(
        requester=user,
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
    user, err = require_user(request)
    if err:
        return err

    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False)
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)
    if not is_manager(user) and req.requester_id != user.id:
        return Response({'detail': 'forbidden'}, status=403)

    return Response(SupportRequestSerializer(req).data)

@api_view(['PUT'])
def support_request_form_api(request, rid: int):
    """
    PUT сформировать заявку (создатель = фиксированный пользователь).
    Ставит статус 'formed' и requested_at.
    """
    user, err = require_user(request)
    if err:
        return err

    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False)
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    if not is_manager(user) and req.requester_id != user.id:
        return Response({'detail': 'forbidden'}, status=403)

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
    'результат'это случайная галочка в М-М.
    """

    user, err = require_user(request)
    if err:
        return err

    if not is_manager(user):
        return Response({'detail': 'forbidden'}, status=403)

    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False)
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
    user, err = require_user(request)
    if err:
        return err

    if not is_manager(user):
        return Response({'detail': 'forbidden'}, status=403)

    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False)
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
    user, err = require_user(request)
    if err:
        return err

    updated = (SupportRequest.objects
               .filter(
                   id=rid,
                   status=SupportRequest.Status.DRAFT,
                   is_deleted=False,
                   requester=user
               )

               .update(is_deleted=True, deleted_at=now(), status=SupportRequest.Status.DELETED))
    if not updated:
        return Response({'detail': 'not allowed or not found'}, status=400)
    return Response(status=204)

@api_view(['GET'])
def support_requests_list_api(request):
    """
    GET список заявок (для фильтров):
    ?status=formed|finished|rejected|draft
    ?date_from=YYYY-MM-DD  (по requested_at)
    ?date_to=YYYY-MM-DD
    """
    user, err = require_user(request)
    if err:
        return err

    status_param = request.GET.get('status')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')

    qs = SupportRequest.objects.filter(is_deleted=False)

    if not is_manager(user):
        qs = qs.filter(requester=user)

    if status_param:
        qs = qs.filter(status=status_param)

    if date_from:
        qs = qs.filter(requested_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(requested_at__date__lte=date_to)

    qs = qs.order_by('-requested_at')
    return Response(SupportRequestSerializer(qs, many=True).data)

@api_view(['PUT'])
def support_request_update_api(request, rid: int):
    """
    PUT изменить поля заявки (комнату, описание и т.п.).
    Пример JSON:
    {
      "room": "207",
      "comment": "Срочно"
    }
    """
    user, err = require_user(request)
    if err:
        return err

    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False)
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    if not is_manager(user) and req.requester_id != user.id:
        return Response({'detail': 'forbidden'}, status=403)

    serializer = SupportRequestSerializer(req, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# ------------------ ДОМЕН М-М (строки заявки) ------------------

@api_view(['DELETE'])
def support_request_line_delete_api(request, rid: int, line_id: int):
    """DELETE строку из заявки (без удаления самой заявки)."""
    user, err = require_user(request)
    if err:
        return err

    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False)
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    if not is_manager(user) and req.requester_id != user.id:
        return Response({'detail': 'forbidden'}, status=403)

    deleted, _ = SupportRequestService.objects.filter(
        id=line_id,
        support_requests=req
    ).delete()
    return Response(status=204 if deleted else 404)

@api_view(['PUT'])
def support_request_line_update_api(request, rid: int, line_id: int):
    """
    PUT изменить значения в М-М: по замечанию оставляем comment.
    """
    user, err = require_user(request)
    if err:
        return err

    try:
        req = SupportRequest.objects.get(id=rid, is_deleted=False)
    except SupportRequest.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    if not is_manager(user) and req.requester_id != user.id:
        return Response({'detail': 'forbidden'}, status=403)

    try:
        line = SupportRequestService.objects.get(id=line_id, support_requests=req)
    except SupportRequestService.DoesNotExist:
        return Response({'detail': 'line not found'}, status=404)

    comment = (request.data.get('comment') or '').strip()
    line.comment = comment
    line.save(update_fields=['comment'])
    return Response({'id': line.id, 'comment': line.comment})
