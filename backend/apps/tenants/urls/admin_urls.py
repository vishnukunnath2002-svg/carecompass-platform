"""URL patterns for tenant admin APIs."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.tenants.views import TenantViewSet, SubscriptionPlanViewSet

router = DefaultRouter()
router.register('tenants', TenantViewSet, basename='admin-tenants')
router.register('plans', SubscriptionPlanViewSet, basename='admin-plans')

urlpatterns = [
    path('', include(router.urls)),
]
