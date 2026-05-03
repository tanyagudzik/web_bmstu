from rest_framework import serializers
from .models import CustomUser, SupportService, SupportRequest, SupportRequestService, KBArticle

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
        # qty/amount в ЛР-3 наружу не показываем
        fields = ['id', 'service_id', 'service_name', 'eta', 'img_url', 'comment', 'ok']

class SupportRequestSerializer(serializers.ModelSerializer):
    # список строк заявки
    lines = SupportRequestLineSerializer(source='supportrequestservice_set', many=True, read_only=True)

    class Meta:
        model = SupportRequest
        # системные поля минимально: даты + room
        fields = ['id', 'created_at', 'requested_at', 'finished_at', 'room', 'lines']

class ServiceImageSerializer(serializers.Serializer):
    img_url = serializers.CharField()

class KBArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = KBArticle
        fields = ['id', 'title', 'content', 'description', 'tags',
                  'category', 'img_url', 'is_active', 'created_at']