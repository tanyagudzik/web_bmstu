from django.apps import AppConfig


class BmstuLabConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bmstu_lab'

    def ready(self):
        import bmstu_lab.signals  # noqa: F401
