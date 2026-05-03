"""
Коннектор для синхронизации БЗ из Confluence.

Источник [12] TableVault — управление динамическими коллекциями документов.
"""
import logging
import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand, CommandParser
from bmstu_lab.models import KBArticle, KBArticleImage
from bmstu_lab.kb_indexer import index_article

logger = logging.getLogger(__name__)

# Маппинг лейблов Confluence → категории KBArticle
LABEL_TO_CATEGORY = {
    "network": "network",
    "vpn": "network",
    "printer": "printer",
    "software": "software",
    "hardware": "hardware",
    "email": "email",
    "access": "access",
}


def extract_text_from_html(html: str) -> str:
    """Извлекает чистый текст из Confluence Storage Format."""
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(separator=" ", strip=True)


def extract_images_from_html(html: str, base_url: str,
                              page_id: str,
                              session: requests.Session) -> list[dict]:
    """
    Извлекает ВСЕ изображения из HTML Confluence.
    Возвращает список словарей: {url, alt_text, sort_order}
    """
    soup = BeautifulSoup(html, "html.parser")
    images = []
    order = 0

    # Стандартные img
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if src:
            if src.startswith("/"):
                src = base_url.rstrip("/") + src
            images.append({
                "url": src,
                "alt_text": img.get("alt", ""),
                "sort_order": order,
            })
            order += 1

    # Confluence-специфичные вложения <ac:image>
    for ac_img in soup.find_all("ac:image"):
        ri = ac_img.find("ri:attachment")
        if ri and ri.get("ri:filename"):
            filename = ri["ri:filename"]
            # Формируем URL для скачивания вложения
            attachment_url = (
                f"{base_url.rstrip('/')}/download/attachments/"
                f"{page_id}/{filename}"
            )
            images.append({
                "url": attachment_url,
                "alt_text": ac_img.get("ac:alt", filename),
                "sort_order": order,
            })
            order += 1

    return images


def guess_category(labels: list[str]) -> str:
    """Определяет категорию статьи по лейблам Confluence."""
    for label in labels:
        cat = LABEL_TO_CATEGORY.get(label.lower())
        if cat:
            return cat
    return "other"


class Command(BaseCommand):
    help = "Синхронизирует статьи из Confluence в БЗ"

    def add_arguments(self, parser: CommandParser):
        parser.add_argument("--base-url", required=True,
                            help="URL Confluence (например https://wiki.company.ru)")
        parser.add_argument("--space", required=True,
                            help="Ключ пространства (например KB)")
        parser.add_argument("--user", required=True,
                            help="Логин Confluence")
        parser.add_argument("--token", required=True,
                            help="API-токен или пароль")
        parser.add_argument("--dry-run", action="store_true",
                            help="Только показать, что будет синхронизировано")

    def handle(self, *args, **options):
        base_url = options["base_url"].rstrip("/")
        space = options["space"]
        dry_run = options["dry_run"]

        session = requests.Session()
        session.auth = (options["user"], options["token"])

        # Получаем все страницы пространства
        url = (
            f"{base_url}/rest/api/content"
            f"?spaceKey={space}"
            f"&expand=body.storage,metadata.labels"
            f"&limit=100"
        )

        created = 0
        updated = 0
        images_total = 0

        while url:
            resp = session.get(url)
            resp.raise_for_status()
            data = resp.json()

            for page in data.get("results", []):
                page_id = str(page["id"])
                title = page["title"]
                html = page.get("body", {}).get("storage", {}).get("value", "")
                labels = [
                    lb["name"]
                    for lb in page.get("metadata", {})
                                  .get("labels", {})
                                  .get("results", [])
                ]

                content = extract_text_from_html(html)
                images = extract_images_from_html(html, base_url, page_id, session)
                category = guess_category(labels)

                if dry_run:
                    self.stdout.write(
                        f"  [DRY-RUN] {page_id}: {title} "
                        f"({category}, {len(content)} символов, "
                        f"{len(images)} картинок)"
                    )
                    continue

                article, is_new = KBArticle.objects.update_or_create(
                    confluence_page_id=page_id,
                    defaults={
                        "title": title,
                        "content": content,
                        "description": title,
                        "tags": ", ".join(labels),
                        "category": category,
                        "img_url": images[0]["url"] if images else None,
                    },
                )

                # Сохраняем ВСЕ картинки статьи
                # Удаляем старые и создаём заново
                article.images.all().delete()
                for img_data in images:
                    KBArticleImage.objects.create(
                        article=article,
                        image_url=img_data["url"],
                        alt_text=img_data["alt_text"],
                        sort_order=img_data["sort_order"],
                    )
                images_total += len(images)

                # Переиндексировать в Redis Vector Search
                try:
                    index_article(article)
                except Exception as e:
                    logger.warning(f"Ошибка индексации #{article.id}: {e}")

                if is_new:
                    created += 1
                else:
                    updated += 1

            # Пагинация
            links = data.get("_links", {})
            next_link = links.get("next")
            url = f"{base_url}{next_link}" if next_link else None

        self.stdout.write(self.style.SUCCESS(
            f"Синхронизация завершена: создано {created}, "
            f"обновлено {updated}, картинок {images_total}"
        ))