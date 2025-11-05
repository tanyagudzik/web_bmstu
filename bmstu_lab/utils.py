from django.contrib.auth import get_user_model


def get_fixed_user():
    user_model = get_user_model()
    user, _ = user_model.objects.get_or_create(
        username="student_demo",
        defaults={
            "first_name": "Студент",
            "last_name": "Демо",
            "is_active": True,
        },
    )
    return user