from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import KBArticle


@receiver(post_save, sender=KBArticle)
def index_article_on_save(sender, instance, **kwargs):
    """Автоматическая переиндексация статьи при сохранении."""
    if instance.is_active:
        try:
            from .kb_indexer import index_article
            index_article(instance)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                f"Не удалось проиндексировать статью #{instance.id}: {e}"
            )