"""URL patterns for tenant-scoped tenant info."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.tenants.views import TenantCurrentView

router = DefaultRouter()
router.register('', TenantCurrentView, basename='tenant-info')

urlpatterns = [
    path('', include(router.urls)),
]
