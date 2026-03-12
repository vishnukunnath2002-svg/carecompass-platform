"""apps/bookings — URL configuration"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, ServiceRequestViewSet

router = DefaultRouter()
router.register('', BookingViewSet, basename='bookings')

urlpatterns = [
    path('', include(router.urls)),
    path('service-requests/', include(
        [path('', ServiceRequestViewSet.as_view({'get': 'list', 'post': 'create'})),
         path('<uuid:pk>/', ServiceRequestViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}))]
    )),
]
