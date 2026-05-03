from django.core.management.base import BaseCommand
from bmstu_lab.kb_indexer import index_all_articles


class Command(BaseCommand):
    help = "Индексирует все статьи БЗ в Redis Vector Search"

    def handle(self, *args, **options):
        total = index_all_articles()
        self.stdout.write(self.style.SUCCESS(
            f"Проиндексировано {total} статей в Redis Vector Search"
        ))