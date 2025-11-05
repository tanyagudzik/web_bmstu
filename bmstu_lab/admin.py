from django.contrib import admin
from .models import SupportService, SupportRequest, SupportRequestService


@admin.register(SupportService)
class SupportServiceAdmin(admin.ModelAdmin):
    """Настройки отображения справочника услуг."""
    list_display = ("id", "title", "eta", "is_active", "is_deleted")
    list_filter = ("is_active", "is_deleted")
    search_fields = ("title", "description")


class SupportRequestServiceInline(admin.TabularInline):
    """Вложенная таблица состава заявки (услуги внутри заявки)."""
    model = SupportRequestService
    extra = 0  # не показывать пустые строки по умолчанию


@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    """Настройки отображения заявок."""
    list_display = (
        "id",
        "status",
        "created_at",
        "requester",
        "engineer",
        "requested_at",
        "finished_at",
        "is_deleted",
    )
    list_filter = ("status", "is_deleted")
    search_fields = ("id", "requester__username", "engineer__username")
    inlines = [SupportRequestServiceInline]


