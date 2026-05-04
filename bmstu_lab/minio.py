"""
Модуль для работы с MinIO (S3-совместимое хранилище).
Адаптировано из методички ЛР3 (add_pic → add_file).

Используется для хранения:
  — изображений услуг (SupportService.img_url)
  — скриншотов и картинок статей БЗ (KBArticle.img_url)
"""
import uuid
from django.conf import settings
from minio import Minio
from django.core.files.uploadedfile import UploadedFile
from rest_framework.response import Response
from rest_framework import status as http_status


def _get_client() -> Minio:
    """Создаёт и возвращает MinIO-клиент по настройкам из settings.py."""
    return Minio(
        endpoint=settings.AWS_S3_ENDPOINT_URL,
        access_key=settings.AWS_ACCESS_KEY_ID,
        secret_key=settings.AWS_SECRET_ACCESS_KEY,
        secure=settings.MINIO_USE_SSL,
    )


def _ensure_bucket(client: Minio, bucket: str):
    """Создаёт бакет, если его ещё нет."""
    if not client.bucket_exists(bucket):
        client.make_bucket(bucket)


def process_file_upload(
    file_object: UploadedFile,
    client: Minio,
    bucket: str,
    object_name: str,
) -> str | dict:
    """
    Загружает файл в MinIO.
    Возвращает URL объекта (str) или dict с ключом 'error'.
    """
    try:
        _ensure_bucket(client, bucket)
        client.put_object(
            bucket,
            object_name,
            file_object,
            file_object.size,
            content_type=file_object.content_type or "application/octet-stream",
        )
        # Публичный URL формируется через MINIO_PUBLIC_ENDPOINT (для браузера),
        # а не через AWS_S3_ENDPOINT_URL (который может быть minio:9000 внутри Docker)
        public_endpoint = getattr(
            settings, "MINIO_PUBLIC_ENDPOINT", settings.AWS_S3_ENDPOINT_URL
        )
        protocol = "https" if settings.MINIO_USE_SSL else "http"
        return f"{protocol}://{public_endpoint}/{bucket}/{object_name}"
    except Exception as e:
        return {"error": str(e)}


def add_pic(obj, pic, bucket: str | None = None):
    """
    Аналог add_pic из методички ЛР3.
    Загружает изображение в MinIO, сохраняет URL в obj.img_url.

    :param obj: модель с полем img_url (SupportService или KBArticle)
    :param pic: загруженный файл (request.FILES.get(...))
    :param bucket: имя бакета (по умолчанию из settings)
    :return: Response с результатом
    """
    if bucket is None:
        bucket = settings.AWS_STORAGE_BUCKET_NAME

    client = _get_client()

    if not pic:
        return Response(
            {"error": "Нет файла для загрузки."},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    # Проверка, что загружается именно изображение
    content_type = getattr(pic, "content_type", "") or ""
    if not content_type.startswith("image/"):
        return Response(
            {"error": f"Допустимы только изображения. Получен: {content_type}"},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    # Дополнительная проверка расширения файла
    allowed_extensions = {"jpg", "jpeg", "png", "gif", "webp", "svg"}
    ext = pic.name.rsplit(".", 1)[-1].lower() if "." in pic.name else ""
    if ext not in allowed_extensions:
        return Response(
            {"error": f"Допустимые расширения: {', '.join(sorted(allowed_extensions))}. Получено: .{ext}"},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    # Генерируем уникальное имя на латинице (по методичке)
    image_name = f"{obj.__class__.__name__.lower()}_{obj.id}_{uuid.uuid4().hex[:8]}.{ext}"

    result = process_file_upload(pic, client, bucket, image_name)

    if isinstance(result, dict) and "error" in result:
        return Response(result, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

    obj.img_url = result
    obj.save(update_fields=["img_url"])
    return Response({"detail": "image uploaded", "url": result})
