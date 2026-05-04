from django.db import transaction, models
from django.utils.timezone import now
from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .kb_indexer import search_similar

import random

from .models import SupportService, SupportRequest, SupportRequestService, KBArticle
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    SupportServiceSerializer,
    SupportRequestSerializer,
    SupportRequestUpdateSerializer,
    KBArticleSerializer,
    ServiceImageResponseSerializer,
    ImageUploadResponseSerializer,
    RequestLineUpdateSerializer,
    MessageSerializer,
    CartResponseSerializer,
    AddToRequestResponseSerializer,
    FormResponseSerializer,
    FinishResponseSerializer,
    RejectResponseSerializer,
    LineUpdateResponseSerializer,
    KBSearchResponseSerializer,
    MetricsIngestSerializer,
    MetricsResponseSerializer,
)
from django.views.decorators.csrf import csrf_exempt
from .utils import create_session, delete_session, get_user_by_session_id
from .minio import add_pic

User = get_user_model()


@swagger_auto_schema(
    method='post',
    request_body=RegisterSerializer,
    responses={201: MessageSerializer(), 400: MessageSerializer()},
)
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def register_user_api(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"detail": "User created"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@swagger_auto_schema(
    method='post',
    request_body=LoginSerializer,
    responses={200: MessageSerializer(), 400: MessageSerializer()},
)
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


@swagger_auto_schema(method='post', responses={200: MessageSerializer()})
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

@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('q', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                          description='Фильтр по названию услуги', required=False),
    ],
    responses={200: SupportServiceSerializer(many=True)},
)
@api_view(['GET'])
def support_services_api(request):
    """GET список услуг с фильтром ?q= ; удалённые и неактивные не отдаём."""
    q = (request.GET.get('q') or '').strip()
    qs = SupportService.objects.filter(is_active=True, is_deleted=False)
    if q:
        qs = qs.filter(title__icontains=q)
    return Response(SupportServiceSerializer(qs, many=True).data)


@swagger_auto_schema(method='get', responses={200: SupportServiceSerializer(), 404: MessageSerializer()})
@api_view(['GET'])
def support_service_api(request, service_id: int):
    """GET одна услуга."""
    try:
        s = SupportService.objects.get(pk=service_id, is_active=True, is_deleted=False)
    except SupportService.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)
    return Response(SupportServiceSerializer(s).data)


@swagger_auto_schema(
    method='post',
    responses={201: AddToRequestResponseSerializer(), 401: MessageSerializer(), 404: MessageSerializer()},
)
@api_view(['POST'])
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


@swagger_auto_schema(
    method='post',
    request_body=SupportServiceSerializer,
    responses={201: SupportServiceSerializer(), 400: MessageSerializer(), 401: MessageSerializer(),
               403: MessageSerializer()},
)
@api_view(['POST'])
def support_service_create_api(request):
    """POST создание услуги (JSON). Изображение загружается отдельно через PUT /image."""
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


@swagger_auto_schema(
    method='put',
    manual_parameters=[
        openapi.Parameter('pic', openapi.IN_FORM, type=openapi.TYPE_FILE,
                          description='Файл изображения', required=True),
    ],
    responses={200: ServiceImageResponseSerializer(), 400: MessageSerializer(), 401: MessageSerializer(),
               403: MessageSerializer(), 404: MessageSerializer()},
)
@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
def support_service_upload_image_api(request, service_id: int):
    """PUT загрузка изображения услуги через MinIO (по методичке ЛР3)."""
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

    pic = request.FILES.get('pic')
    if not pic:
        return Response({'detail': 'pic file is required'}, status=400)

    pic_result = add_pic(service, pic)
    if 'error' in pic_result.data:
        return pic_result

    return Response(
        {'id': service.id, 'title': service.title, 'img_url': service.img_url},
        status=status.HTTP_200_OK
    )


# ------------------ ДОМЕН ЗАЯВКИ ------------------

@swagger_auto_schema(method='get', responses={200: CartResponseSerializer(), 401: MessageSerializer()})
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


@swagger_auto_schema(method='get',
                     responses={200: SupportRequestSerializer(), 401: MessageSerializer(), 404: MessageSerializer()})
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


@swagger_auto_schema(method='put',
                     responses={200: FormResponseSerializer(), 400: MessageSerializer(), 401: MessageSerializer()})
@api_view(['PUT'])
def support_request_form_api(request, rid: int):
    """
    PUT сформировать заявку (создатель = фиксированный пользователь).
    Ставит статус 'formed' и requested_at.
    Валидация: заявка должна содержать хотя бы одну услугу и обязательное поле room.
    Расчёт: при формировании вычисляется amount в каждой строке м-м (qty * service.id как заглушка).
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

    # Валидация обязательных полей
    if not req.room:
        return Response({'detail': 'room is required before forming'}, status=400)

    lines = SupportRequestService.objects.filter(support_requests=req)
    if not lines.exists():
        return Response({'detail': 'request must have at least one service'}, status=400)

    # Расчёт доп. поля в м-м при формировании
    with transaction.atomic():
        for ln in lines:
            ln.amount = ln.qty * ln.support_service_id  # расчёт amount
            ln.save(update_fields=['amount'])

        req.status = SupportRequest.Status.FORMED
        req.requested_at = now()
        req.save(update_fields=['status', 'requested_at'])

    return Response({'status': 'formed', 'requested_at': req.requested_at})


@swagger_auto_schema(method='put',
                     responses={200: FinishResponseSerializer(), 400: MessageSerializer(), 401: MessageSerializer(),
                                403: MessageSerializer()})
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
        req.engineer = user
        req.save(update_fields=['status', 'finished_at', 'engineer'])
    return Response({'status': 'finished', 'finished_at': req.finished_at})


@swagger_auto_schema(method='put',
                     responses={200: RejectResponseSerializer(), 400: MessageSerializer(), 401: MessageSerializer(),
                                403: MessageSerializer()})
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
    req.engineer = user
    req.save(update_fields=['status', 'finished_at', 'engineer'])
    return Response({'status': 'rejected', 'finished_at': req.finished_at})


@swagger_auto_schema(method='delete', responses={204: 'No Content', 400: MessageSerializer(), 401: MessageSerializer()})
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


@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('status', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                          description='Фильтр по статусу: formed|finished|rejected|draft',
                          required=False),
        openapi.Parameter('date_from', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                          description='Дата от (YYYY-MM-DD)', required=False),
        openapi.Parameter('date_to', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                          description='Дата до (YYYY-MM-DD)', required=False),
    ],
    responses={200: SupportRequestSerializer(many=True), 401: MessageSerializer()},
)
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
    else:
        # По умолчанию исключаем черновики из списка (по требованию ЛР3)
        qs = qs.exclude(status=SupportRequest.Status.DRAFT)

    if date_from:
        qs = qs.filter(requested_at__date__gte=date_from)
    if date_to:
        qs = qs.filter(requested_at__date__lte=date_to)

    qs = qs.order_by('-requested_at')
    return Response(SupportRequestSerializer(qs, many=True).data)


@swagger_auto_schema(
    method='put',
    request_body=SupportRequestUpdateSerializer,
    responses={200: SupportRequestSerializer(), 400: MessageSerializer(), 401: MessageSerializer()},
)
@api_view(['PUT'])
def support_request_update_api(request, rid: int):
    """
    PUT изменить поля заявки (кабинет).
    Пример JSON:
    {
      "room": "207"
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

    update_ser = SupportRequestUpdateSerializer(data=request.data)
    if not update_ser.is_valid():
        return Response(update_ser.errors, status=400)

    for field, value in update_ser.validated_data.items():
        setattr(req, field, value)
    req.save(update_fields=list(update_ser.validated_data.keys()))

    return Response(SupportRequestSerializer(req).data)


# ------------------ ДОМЕН М-М (строки заявки) ------------------

@swagger_auto_schema(method='delete', responses={204: 'No Content', 401: MessageSerializer(), 404: MessageSerializer()})
@api_view(['DELETE'])
def support_request_line_delete_api(request, rid: int, service_id: int):
    """DELETE строку из заявки по (rid, service_id) — без PK м-м (по требованию ЛР3)."""
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
        support_requests=req,
        support_service_id=service_id,
    ).delete()
    return Response(status=204 if deleted else 404)


@swagger_auto_schema(
    method='put',
    request_body=RequestLineUpdateSerializer,
    responses={200: LineUpdateResponseSerializer(), 401: MessageSerializer(), 404: MessageSerializer()},
)
@api_view(['PUT'])
def support_request_line_update_api(request, rid: int, service_id: int):
    """
    PUT изменить строку м-м по (rid, service_id) — без PK м-м (по требованию ЛР3).
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
        line = SupportRequestService.objects.get(
            support_requests=req,
            support_service_id=service_id,
        )
    except SupportRequestService.DoesNotExist:
        return Response({'detail': 'line not found'}, status=404)

    ser = RequestLineUpdateSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=400)

    line.comment = ser.validated_data.get('comment', '') or ''
    line.save(update_fields=['comment'])
    return Response({'id': line.id, 'comment': line.comment})


# ------------------ KBArticleSerializer ------------------

@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('q', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                          description='Поиск по заголовку, содержанию, тегам', required=False),
        openapi.Parameter('category', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                          description='Фильтр по категории', required=False),
    ],
    responses={200: KBArticleSerializer(many=True)},
)
@api_view(['GET'])
def kb_articles_api(request):
    """GET список статей БЗ с фильтром ?q= и ?category=."""
    q = (request.GET.get('q') or '').strip()
    category = (request.GET.get('category') or '').strip()
    qs = KBArticle.objects.filter(is_active=True)
    if q:
        qs = qs.filter(
            models.Q(title__icontains=q) |
            models.Q(content__icontains=q) |
            models.Q(tags__icontains=q)
        )
    if category:
        qs = qs.filter(category=category)
    return Response(KBArticleSerializer(qs, many=True).data)


@swagger_auto_schema(method='get', responses={200: KBArticleSerializer(), 404: MessageSerializer()})
@api_view(['GET'])
def kb_article_api(request, article_id: int):
    """GET одна статья БЗ."""
    try:
        a = KBArticle.objects.get(pk=article_id, is_active=True)
    except KBArticle.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)
    return Response(KBArticleSerializer(a).data)


@swagger_auto_schema(
    method='put',
    manual_parameters=[
        openapi.Parameter('pic', openapi.IN_FORM, type=openapi.TYPE_FILE,
                          description='Файл изображения статьи БЗ', required=True),
    ],
    responses={200: ImageUploadResponseSerializer(), 400: MessageSerializer(), 401: MessageSerializer(),
               403: MessageSerializer(), 404: MessageSerializer()},
)
@api_view(['PUT'])
@parser_classes([MultiPartParser, FormParser])
def kb_article_upload_image_api(request, article_id: int):
    """PUT загрузка изображения статьи БЗ через MinIO."""
    user, err = require_user(request)
    if err:
        return err
    if not is_manager(user):
        return Response({'detail': 'forbidden'}, status=403)

    try:
        article = KBArticle.objects.get(pk=article_id, is_active=True)
    except KBArticle.DoesNotExist:
        return Response({'detail': 'not found'}, status=404)

    pic = request.FILES.get('pic')
    if not pic:
        return Response({'detail': 'pic file is required'}, status=400)

    pic_result = add_pic(article, pic)
    if 'error' in pic_result.data:
        return pic_result

    return Response({'detail': 'image uploaded', 'url': article.img_url})


# ------------------ API эндпоинт поиска ------------------

@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('q', openapi.IN_QUERY, type=openapi.TYPE_STRING,
                          description='Текст запроса для семантического поиска', required=True),
        openapi.Parameter('top_k', openapi.IN_QUERY, type=openapi.TYPE_INTEGER,
                          description='Количество результатов (макс. 20)', required=False),
    ],
    responses={200: KBSearchResponseSerializer(), 400: MessageSerializer()},
)
@api_view(['GET'])
def kb_search_api(request):
    """
    GET /api/kb/search/?q=текст запроса&top_k=5
    Семантический поиск по базе знаний через Redis Vector Search.
    """
    q = (request.GET.get('q') or '').strip()
    if not q:
        return Response({'detail': 'query parameter q is required'}, status=400)

    top_k = int(request.GET.get('top_k', 5))
    top_k = min(top_k, 20)

    try:
        results = search_similar(q, top_k=top_k)
    except Exception as e:
        # Fallback на текстовый поиск если Redis недоступен
        from .models import KBArticle
        qs = KBArticle.objects.filter(
            is_active=True
        ).filter(
            models.Q(title__icontains=q) |
            models.Q(content__icontains=q) |
            models.Q(tags__icontains=q)
        )[:top_k]
        results = [
            {
                "text": a.content[:500],
                "article_id": a.id,
                "article_title": a.title,
                "category": a.category,
                "chunk_index": 0,
                "score": 0.0,
            }
            for a in qs
        ]

    return Response({"query": q, "results": results})


@swagger_auto_schema(
    method='post',
    request_body=MetricsIngestSerializer,
    responses={200: MetricsResponseSerializer()},
)
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def metrics_ingest_api(request):
    """
    POST /api/metrics/
    Приём клиентских метрик (latency агентов, faithfulness) → Pushgateway.
    """

    try:
        from prometheus_client import CollectorRegistry, Gauge, push_to_gateway

        registry = CollectorRegistry()
        data = request.data

        # Метрики агентов
        for agent_name in ['context', 'ranking', 'generation', 'validation']:
            key = f"agent_{agent_name}_ms"
            if key in data:
                g = Gauge(
                    f'webllm_agent_{agent_name}_latency_ms',
                    f'Latency of {agent_name} agent in ms',
                    registry=registry,
                )
                g.set(float(data[key]))

        # Общее время
        if 'total_ms' in data:
            g = Gauge('webllm_total_latency_ms', 'Total RAG pipeline latency',
                      registry=registry)
            g.set(float(data['total_ms']))

        # Faithfulness
        if 'faithful' in data:
            g = Gauge('webllm_response_faithful', 'Whether response was faithful (1/0)',
                      registry=registry)
            g.set(1.0 if data['faithful'] else 0.0)

        # Model name как label
        if 'model' in data:
            g = Gauge('webllm_model_info', 'Current model',
                      labelnames=['model_name'], registry=registry)
            g.labels(model_name=data['model']).set(1)

        push_to_gateway(
            'pushgateway:9091', job='webllm_client',
            registry=registry,
        )

        return Response({'status': 'ok'})

    except Exception as e:
        # Не падаем, если Pushgateway недоступен
        return Response({'status': 'ok', 'warning': str(e)})