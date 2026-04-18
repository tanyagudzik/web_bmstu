from django.shortcuts import render, get_object_or_404, redirect
from django.db import connection, transaction
from django.utils.timezone import now
from django.http import HttpResponseNotAllowed
from django.urls import reverse
from .models import SupportService, SupportRequest, SupportRequestService
from .utils import get_current_user


def support_services(request):
    """Страница каталога услуг."""
    q = (request.GET.get("q") or "").strip().lower()

    services = SupportService.objects.filter(is_active=True, is_deleted=False)
    if q:
        services = services.filter(title__icontains=q)

    # Ищем черновик текущего пользователя (корзину)
    current_request = None
    current_user = get_current_user(request)
    current_request = (
        SupportRequest.objects.filter(
            requester=current_user, status=SupportRequest.Status.DRAFT, is_deleted=False
        ).first()
    )

    ctx = {
        "items": services,
        "q": q,
        "badge_count": (
            SupportRequestService.objects.filter(support_requests=current_request).count()
            if current_request
            else 0
        ),
        "badge_url": (
            reverse("support_request", args=[current_request.id])
            if current_request
            else "#"
        ),
    }
    return render(request, "pages/support_services.html", ctx)


def support_service(request, service_id: int):
    """Карточка услуги."""
    item = get_object_or_404(
        SupportService, pk=service_id, is_active=True, is_deleted=False
    )
    return render(request, "pages/support_service.html", {"item": item})


def add_service_to_request(request, service_id: int):
    """Добавление услуги в текущую заявку-черновик."""
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    current_user = get_current_user(request)
    service = get_object_or_404(
        SupportService, pk=service_id, is_active=True, is_deleted=False
    )

    with transaction.atomic():
        draft, _ = SupportRequest.objects.get_or_create(
            requester=current_user,
            status=SupportRequest.Status.DRAFT,
            is_deleted=False,
            defaults={"created_at": now()},
        )
        SupportRequestService.objects.get_or_create(
            support_service=service,
            support_requests=draft,
            defaults={
                "qty": 1,
                "amount": None,
                "comment": "",
            }
        )

    redirect_to = request.POST.get("next") or reverse("support_services")
    return redirect(redirect_to)


def support_request(request, rid: int):
    """Текущая заявка (корзина)."""
    current_user = get_current_user(request)
    req = get_object_or_404(
        SupportRequest,
        id=rid,
        requester=current_user,
        is_deleted=False,
    )

    items = SupportRequestService.objects.filter(support_requests=req).select_related("support_service")

    ctx = {"req": req, "lines": items}
    return render(request, "pages/support_request.html", ctx)

def support_request_form(request, rid: int):
    """
    Оформление заявки:
    - сохраняем room (кабинет) в самой заявке,
    - сохраняем comment по каждой строке заявки,
    - переводим статус из draft в formed.
    """
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    current_user = get_current_user(request)
    req = get_object_or_404(
        SupportRequest,
        id=rid,
        requester=current_user,
        is_deleted=False,
    )

    # Берём все строки заявки
    lines = SupportRequestService.objects.filter(support_requests=req)

    with transaction.atomic():
        # ---- room (поле самой заявки) ----
        room = (request.POST.get("room") or "").strip()
        if room:
            req.room = room
        else:
            req.room = None

        # ---- comment по каждой строке ----
        for line in lines:
            key = f"comment_{line.id}"
            comment = (request.POST.get(key) or "").strip()
            line.comment = comment or None
            line.save(update_fields=["comment"])

        # ---- смена статуса на "сформирован" ----
        update_fields = ["room"]
        if req.status == SupportRequest.Status.DRAFT:
            req.status = SupportRequest.Status.FORMED
            req.requested_at = now()
            update_fields.extend(["status", "requested_at"])

        req.save(update_fields=update_fields)

    return redirect("support_request", rid=rid)


def support_request_line_delete(request, rid: int, line_id: int):
    """
    Удалить одну услугу из заявки.
    Делаем через GET по ссылке с крестиком и возвращаемся на страницу заявки.
    """
    current_user = get_current_user(request)
    req = get_object_or_404(
        SupportRequest,
        id=rid,
        requester=current_user,
        is_deleted=False,
    )

    SupportRequestService.objects.filter(
        id=line_id,
        support_requests=req,
    ).delete()

    return redirect("support_request", rid=rid)

def delete_request_sql(request, rid: int):
    """
    Логическое удаление заявки через SQL (без ORM).
    """
    current_user = get_current_user(request)
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE support_requests
            SET is_deleted = TRUE,
                deleted_at = NOW(),
                status = 'deleted'
            WHERE id = %s AND requester_id = %s AND status = 'draft'
            """,
            [rid, current_user.id],
        )
    return render(request, "pages/request_deleted.html", {"rid": rid})
