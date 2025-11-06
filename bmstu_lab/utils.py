from django.contrib.auth import get_user_model

User = get_user_model()

def get_current_user():
    """
    Возвращает одного и того же пользователя для ЛР2–ЛР3.
    Подставь нужный логин, например 'admin_bmstu'.
    """
    username = "admin_bmstu"
    user = User.objects.filter(username=username).first()
    if not user:
        # fallback: берём любого суперпользователя, иначе первого
        user = User.objects.filter(is_superuser=True).first() or User.objects.first()
    return user