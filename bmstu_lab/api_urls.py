from django.urls import path
from . import api_views as v

urlpatterns = [
    # УСЛУГИ
    path('api/support_services', v.support_services_api, name='api_support_services'),
    path('api/support_service/<int:service_id>', v.support_service_api, name='api_support_service'),
    path('api/support_service/<int:service_id>/add_to_request', v.support_service_add_to_request_api, name='api_support_service_add'),

    # ЗАЯВКИ
    path('api/support_request/cart', v.support_request_cart_api, name='api_support_request_cart'),
    path('api/support_request/<int:rid>', v.support_request_api, name='api_support_request'),
    path('api/support_request/<int:rid>/form', v.support_request_form_api, name='api_support_request_form'),
    path('api/support_request/<int:rid>/finish', v.support_request_finish_api, name='api_support_request_finish'),
    path('api/support_request/<int:rid>/reject', v.support_request_reject_api, name='api_support_request_reject'),
    path('api/support_request/<int:rid>/delete', v.support_request_delete_api, name='api_support_request_delete'),

    # М-М (строки заявки)
    path('api/support_request/<int:rid>/line/<int:line_id>', v.support_request_line_update_api, name='api_support_request_line_update'),
    path('api/support_request/<int:rid>/line/<int:line_id>/delete', v.support_request_line_delete_api, name='api_support_request_line_delete'),
]
