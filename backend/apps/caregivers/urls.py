from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CaregiverProfileViewSet, SpecializationTagViewSet

router = DefaultRouter()
router.register('', CaregiverProfileViewSet, basename='caregivers')
router.register('specializations', SpecializationTagViewSet, basename='specializations')

urlpatterns = [path('', include(router.urls))]
