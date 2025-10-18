
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('support_service/', views.support_service, name='support_service'),
    path('support_request/<int:service_id>/', views.support_request, name='support_request'),
    # третья страница — текущая заявка (корзина)
    path("request/<int:rid>/", views.request_view, name="request_view"),
]