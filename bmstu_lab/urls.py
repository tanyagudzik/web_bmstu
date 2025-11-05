
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('support_services/', views.support_services, name='support_services'),
    path('support_service/<int:service_id>/', views.support_service, name='support_service'),
    path('support_request/<int:rid>/', views.support_request, name='support_request'),
    path('support_request/<int:rid>/delete/', views.delete_request_sql, name='delete_request_sql'),
]
