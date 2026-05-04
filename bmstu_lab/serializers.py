from rest_framework import serializers
from .models import (
    CustomUser, SupportService, SupportRequest,
    SupportRequestService, KBArticle, KBArticleImage,
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'username', 'password', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'is_staff': {'required': False},
            'is_superuser': {'required': False},
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', ''),
            password=validated_data['password'],
            is_staff=validated_data.get('is_staff', False),
            is_superuser=validated_data.get('is_superuser', False),
        )
        return user


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        return CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', ''),
            password=validated_data['password'],
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class SupportServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportService
        fields = ['id', 'title', 'description', 'eta', 'img_url', 'is_active']


class SupportRequestLineSerializer(serializers.ModelSerializer):
    service_id   = serializers.IntegerField(source='support_service.id', read_only=True)
    service_name = serializers.CharField(source='support_service.title', read_only=True)
    eta          = serializers.CharField(source='support_service.eta', read_only=True)
    img_url      = serializers.CharField(source='support_service.img_url', read_only=True)

    class Meta:
        model = SupportRequestService
        fields = ['id', 'service_id', 'service_name', 'eta', 'img_url', 'comment', 'ok']


class SupportRequestSerializer(serializers.ModelSerializer):
    lines = SupportRequestLineSerializer(
        source='supportrequestservice_set', many=True, read_only=True
    )
    status = serializers.CharField(read_only=True)
    requester = serializers.EmailField(source='requester.email', read_only=True)
    engineer = serializers.EmailField(
        source='engineer.email', read_only=True, default=None
    )
    count_ok = serializers.SerializerMethodField()

    class Meta:
        model = SupportRequest
        fields = [
            'id', 'status', 'requester', 'engineer',
            'created_at', 'requested_at', 'finished_at',
            'room', 'count_ok', 'lines',
        ]

    def get_count_ok(self, obj):
        return obj.supportrequestservice_set.filter(ok=True).count()


class SupportRequestUpdateSerializer(serializers.Serializer):
    """Swagger-сериализатор для PUT изменения полей заявки."""
    room = serializers.CharField(required=False)


class ServiceImageSerializer(serializers.Serializer):
    img_url = serializers.CharField()


class ServiceImageResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    img_url = serializers.CharField()


class RequestLineUpdateSerializer(serializers.Serializer):
    """Swagger-сериализатор для PUT изменения строки заявки."""
    comment = serializers.CharField(required=False)


# ---------- Swagger-only response serializers ----------

class MessageSerializer(serializers.Serializer):
    """Generic {detail: str} response."""
    detail = serializers.CharField()


class CartResponseSerializer(serializers.Serializer):
    request_id = serializers.IntegerField(allow_null=True)
    count = serializers.IntegerField()


class AddToRequestResponseSerializer(serializers.Serializer):
    request_id = serializers.IntegerField()


class FormResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    requested_at = serializers.DateTimeField()


class FinishResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    finished_at = serializers.DateTimeField()


class RejectResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    finished_at = serializers.DateTimeField()


class LineUpdateResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    comment = serializers.CharField()


class KBSearchResultSerializer(serializers.Serializer):
    text = serializers.CharField()
    article_id = serializers.IntegerField()
    article_title = serializers.CharField()
    category = serializers.CharField()
    chunk_index = serializers.IntegerField()
    score = serializers.FloatField()


class KBSearchResponseSerializer(serializers.Serializer):
    query = serializers.CharField()
    results = KBSearchResultSerializer(many=True)


class MetricsIngestSerializer(serializers.Serializer):
    agent_context_ms = serializers.FloatField(required=False)
    agent_ranking_ms = serializers.FloatField(required=False)
    agent_generation_ms = serializers.FloatField(required=False)
    agent_validation_ms = serializers.FloatField(required=False)
    total_ms = serializers.FloatField(required=False)
    faithful = serializers.BooleanField(required=False)
    model = serializers.CharField(required=False)


class MetricsResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    warning = serializers.CharField(required=False)


class KBArticleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = KBArticleImage
        fields = ['id', 'image_url', 'alt_text', 'sort_order']


class KBArticleSerializer(serializers.ModelSerializer):
    images = KBArticleImageSerializer(many=True, read_only=True)

    class Meta:
        model = KBArticle
        fields = [
            'id', 'title', 'content', 'description', 'tags',
            'category', 'img_url', 'is_active', 'created_at', 'images',
        ]