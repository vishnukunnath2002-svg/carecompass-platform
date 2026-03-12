from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgencyServiceViewSet, ServiceCategoryViewSet

router = DefaultRouter()
router.register('categories', ServiceCategoryViewSet, basename='service-categories')
router.register('', AgencyServiceViewSet, basename='services')

urlpatterns = [path('', include(router.urls))]
