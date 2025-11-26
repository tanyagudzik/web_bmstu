from django.contrib.auth import get_user_model

User = get_user_model()

def get_current_user():

    username = "admin_bmstu" # логин моего аккаунта
    user = User.objects.filter(username=username).first()
    if not user:
        # берём любого суперпользователя, иначе первого
        user = User.objects.filter(is_superuser=True).first() or User.objects.first()
    return user