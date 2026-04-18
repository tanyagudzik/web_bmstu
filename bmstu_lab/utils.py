import uuid
import redis
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def get_redis():
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True,  # чтобы get() возвращал str
    )

def create_session(email: str) -> str:
    """
    Создаём "ручную" сессию: ключ uuid -> email (как в методичке).
    """
    session_storage = get_redis()
    sid = str(uuid.uuid4())
    session_storage.set(sid, email)
    return sid

def delete_session(session_id: str) -> None:
    session_storage = get_redis()
    session_storage.delete(session_id)

def get_user_by_session_id(session_id: str):
    """
    Достаём email из Redis по session_id и возвращаем пользователя Django.
    """
    session_storage = get_redis()
    email = session_storage.get(session_id)
    if not email:
        return None
    return User.objects.filter(email=email).first()

def get_current_user(request):
    """
    Текущий пользователь по cookie session_id (ручная сессия в Redis).
    """
    if request is None:
        return None
    session_id = request.COOKIES.get("session_id")
    if not session_id:
        return None
    return get_user_by_session_id(session_id)
