from django.shortcuts import render, get_object_or_404
from django.db import connection
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from .models import SupportService, SupportRequest, SupportRequestService


def support_services(request):
    """Страница каталога услуг."""
    q = (request.GET.get("q") or "").strip().lower()

    services = SupportService.objects.filter(is_active=True, is_deleted=False)
    if q:
        services = services.filter(title__icontains=q)

    # Ищем черновик текущего пользователя (корзину)
    current_request = None
    if request.user.is_authenticated:
        current_request = (
            SupportRequest.objects.filter(
                requester=request.user, status=SupportRequest.Status.DRAFT, is_deleted=False
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


@login_required
def support_request(request, rid: int):
    """Текущая заявка (корзина)."""
    req = get_object_or_404(
        SupportRequest,
        id=rid,
        requester=request.user,
        is_deleted=False,
    )

    items = SupportRequestService.objects.filter(support_requests=req).select_related("support_service")

    ctx = {"req": req, "lines": items}
    return render(request, "pages/support_request.html", ctx)


@login_required
def delete_request_sql(request, rid: int):
    """
    Логическое удаление заявки через SQL (без ORM).
    """
    with connection.cursor() as cursor:
        cursor.execute(
            """
            UPDATE support_requests
            SET is_deleted = TRUE,
                deleted_at = NOW(),
                status = 'deleted'
            WHERE id = %s AND requester_id = %s AND status = 'draft'
            """,
            [rid, request.user.id],
        )
    return render(request, "pages/request_deleted.html", {"rid": rid})
