
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('support_services/', views.support_services, name='support_services'),
    path('support_service/<int:service_id>/', views.support_service, name='support_service'),
    # третья страница — текущая заявка (корзина)
    path('support_request/<int:rid>/', views.support_request, name='support_request'),
]