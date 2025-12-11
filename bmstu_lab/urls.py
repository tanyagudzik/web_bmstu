
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('support_services/', views.support_services, name='support_services'),
    path('support_service/<int:service_id>/', views.support_service, name='support_service'),
    path('support_service/<int:service_id>/add/', views.add_service_to_request, name='support_service_add'),

    # страница текущей заявки
    path('support_request/<int:rid>/', views.support_request, name='support_request'),

    # оформить заявку (кнопка "Оформить заявку")
    path('support_request/<int:rid>/form/', views.support_request_form, name='support_request_form'),

    # удалить одну услугу из заявки (крестик справа)
    path('support_request/<int:rid>/line/<int:line_id>/delete/',
         views.support_request_line_delete,
         name='support_request_line_delete'),

    # логическое удаление всей заявки (кнопка "Удалить заявку")
    path('support_request/<int:rid>/delete/', views.delete_request_sql, name='delete_request_sql'),
]

