from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HospitalProfileViewSet, HospitalRFQViewSet, HospitalQuoteViewSet, PurchaseOrderViewSet

router = DefaultRouter()
router.register('profile', HospitalProfileViewSet, basename='hospital-profile')
router.register('rfqs', HospitalRFQViewSet, basename='hospital-rfqs')
router.register('quotes', HospitalQuoteViewSet, basename='hospital-quotes')
router.register('purchase-orders', PurchaseOrderViewSet, basename='purchase-orders')

urlpatterns = [path('', include(router.urls))]
