from django.urls import path
from . import api_views as v

urlpatterns = [

    # АУТЕНТИФИКАЦИЯ
    path('api/register', v.register_user_api, name='api_register'),
    path('api/login', v.login_api, name='api_login'),
    path('api/logout', v.logout_api, name='api_logout'),

    # УСЛУГИ
    path('api/support_services', v.support_services_api, name='api_support_services'),
    path('api/support_service/<int:service_id>', v.support_service_api, name='api_support_service'),
    path('api/support_service/<int:service_id>/add_to_request', v.support_service_add_to_request_api, name='api_support_service_add'),
    path('api/support_services/create', v.support_service_create_api, name='api_support_service_create'),
    path('api/support_service/<int:service_id>/image', v.support_service_upload_image_api, name='api_support_service_image'),

    # ЗАЯВКИ
    path('api/support_request/cart', v.support_request_cart_api, name='api_support_request_cart'),
    path('api/support_request/<int:rid>', v.support_request_api, name='api_support_request'),
    path('api/support_request/<int:rid>/form', v.support_request_form_api, name='api_support_request_form'),
    path('api/support_request/<int:rid>/finish', v.support_request_finish_api, name='api_support_request_finish'),
    path('api/support_request/<int:rid>/reject', v.support_request_reject_api, name='api_support_request_reject'),
    path('api/support_request/<int:rid>/delete', v.support_request_delete_api, name='api_support_request_delete'),
    path('api/support_requests', v.support_requests_list_api, name='api_support_requests'),
    path('api/support_request/<int:rid>/update', v.support_request_update_api, name='api_support_request_update'),

    # М-М (строки заявки)
    path('api/support_request/<int:rid>/line/<int:line_id>', v.support_request_line_update_api, name='api_support_request_line_update'),
    path('api/support_request/<int:rid>/line/<int:line_id>/delete', v.support_request_line_delete_api, name='api_support_request_line_delete'),

    # БАЗА ЗНАНИЙ
    path('api/kb/articles', v.kb_articles_api, name='api_kb_articles'),
    path('api/kb/article/<int:article_id>', v.kb_article_api, name='api_kb_article'),
]
