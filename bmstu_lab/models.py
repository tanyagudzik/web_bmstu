from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager

class NewUserManager(UserManager):
    """Менеджер для пользователя с логином по email."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('User must have an email address')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """Кастомный пользователь: логин по email."""
    email = models.EmailField("email адрес", unique=True)
    # Оставим username как доп. поле, чтобы было удобно искать и не ломать админку/шаблоны
    username = models.CharField("имя пользователя", max_length=150, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(
        default=False,
        verbose_name="Является ли пользователь менеджером?",
    )
    is_superuser = models.BooleanField(
        default=False,
        verbose_name="Является ли пользователь админом?",
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # при создании суперпользователя попросят ещё и username

    objects = NewUserManager()

    class Meta:
        verbose_name = "пользователь"
        verbose_name_plural = "пользователи"

    def __str__(self):
        return self.email or self.username or f"User {self.pk}"


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

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="requests",
        verbose_name="пользователь",
        null=True,
        blank=True,
    )
    engineer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="assigned_requests",
        verbose_name="инженер",
    )

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

    ok = models.BooleanField(null=True, blank=True, verbose_name="галочка")

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

class KBArticle(models.Model):
    """Статья базы знаний техподдержки."""

    class Category(models.TextChoices):
        NETWORK    = "network",    "Сеть и VPN"
        PRINTER    = "printer",    "Принтеры и сканеры"
        SOFTWARE   = "software",   "Установка ПО"
        HARDWARE   = "hardware",   "Оборудование"
        EMAIL      = "email",      "Почта и календарь"
        ACCESS     = "access",     "Доступы и учётные записи"
        OTHER      = "other",      "Прочее"

    title       = models.CharField("заголовок", max_length=300)
    content     = models.TextField("содержание")
    description = models.TextField(
        "описание (англ., для SigLIP)",
        help_text="English description for SigLIP embedding. Required.",
    )
    tags        = models.CharField("теги", max_length=500, blank=True)
    category    = models.CharField(
        "категория", max_length=50,
        choices=Category.choices, default=Category.OTHER,
    )
    img_url     = models.TextField("URL скриншота", null=True, blank=True)
    is_active   = models.BooleanField("активна", default=True)
    created_at  = models.DateTimeField("создано", auto_now_add=True)
    updated_at  = models.DateTimeField("обновлено", auto_now=True)
    confluence_page_id = models.CharField(
        "ID страницы Confluence", max_length=50,
        null=True, blank=True, unique=True
    )

    class Meta:
        db_table = "kb_articles"
        verbose_name = "статья БЗ"
        verbose_name_plural = "статьи БЗ"
        ordering = ["id"]

    def __str__(self):
        return f"[{self.get_category_display()}] {self.title}"