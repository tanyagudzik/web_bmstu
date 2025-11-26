from rest_framework import serializers
from .models import SupportService, SupportRequest, SupportRequestService

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
