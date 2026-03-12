from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientProfileViewSet, AddressViewSet

router = DefaultRouter()
router.register('addresses', AddressViewSet, basename='addresses')
router.register('', PatientProfileViewSet, basename='patients')

urlpatterns = [path('', include(router.urls))]
