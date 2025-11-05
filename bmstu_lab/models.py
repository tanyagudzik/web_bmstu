from django.db import models
from django.contrib.auth.models import User


class SupportService(models.Model):
    """support_services (услуга)"""
    title = models.CharField(max_length=200, verbose_name="название")
    description = models.TextField(blank=True, verbose_name="описание")
    eta = models.CharField(max_length=20, blank=True, verbose_name="ожидание")
    img_url = models.TextField(null=True, blank=True, verbose_name="адрес картинки")
    is_active = models.BooleanField(default=True, verbose_name="активна")

    # Логическое удаление:
    is_deleted = models.BooleanField(default=False, verbose_name="пометка удалено")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="когда пометили")

    @property
    def img(self):
        # чтобы шаблоны, где используется {{ item.img }}, продолжили работать
        return self.img_url or ""

    class Meta:
        db_table = "support_services"
        verbose_name = "услуга"
        verbose_name_plural = "услуги"
        ordering = ["id"]

    def __str__(self):
        return self.title


class SupportRequest(models.Model):
    class Status(models.TextChoices):
        DRAFT    = "draft",    "черновик"
        DELETED  = "deleted",  "удалён"
        FORMED   = "formed",   "сформирован"
        FINISHED = "finished", "завершён"
        REJECTED = "rejected", "отклонён"

    requester    = models.ForeignKey(User, on_delete=models.PROTECT, related_name="requests", verbose_name="пользователь")
    engineer     = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True, related_name="assigned_requests", verbose_name="инженер")

    status       = models.CharField("статус", max_length=50, choices=Status.choices, default=Status.DRAFT)
    created_at   = models.DateTimeField("создано", auto_now_add=True)
    requested_at = models.DateTimeField("дата формирования", null=True, blank=True)
    finished_at  = models.DateTimeField("дата завершения", null=True, blank=True)
    room         = models.CharField("кабинет", max_length=50, null=True, blank=True)

    # Логическое удаление
    is_deleted = models.BooleanField("пометка удалено", default=False)
    deleted_at = models.DateTimeField("когда пометили", null=True, blank=True)

    class Meta:
        db_table = "support_requests"
        verbose_name = "заявка"
        verbose_name_plural = "заявки"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Заявка #{self.pk} ({self.get_status_display()})"



class SupportRequestService(models.Model):
    """support_request_service (строка запроса = m-m заявка–услуга)"""
    support_service = models.ForeignKey(
        SupportService, on_delete=models.PROTECT, verbose_name="услуга"
    )
    support_requests = models.ForeignKey(
        SupportRequest, on_delete=models.CASCADE, verbose_name="заявка"
    )
    qty = models.IntegerField(default=1, verbose_name="количество")
    amount = models.IntegerField(null=True, blank=True, verbose_name="сумма")
    comment = models.TextField(null=True, blank=True, verbose_name="комментарий")

    class Meta:
        db_table = "support_request_service"
        verbose_name = "строка заявки"
        verbose_name_plural = "строки заявки"
        # составной уникальный ключ: одна и та же услуга не должна дублироваться в заявке
        constraints = [
            models.UniqueConstraint(
                fields=["support_requests", "support_service"],
                name="uniq_support_request_service"
            )
        ]
        ordering = ["support_requests_id", "id"]

    def __str__(self):
        return f"req={self.support_requests_id} service={self.support_service_id}"
