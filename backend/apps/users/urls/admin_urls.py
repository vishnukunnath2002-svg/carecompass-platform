"""URL patterns for admin user management."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.admin_views import AdminUserViewSet

router = DefaultRouter()
router.register('', AdminUserViewSet, basename='admin-users')

urlpatterns = [
    path('', include(router.urls)),
]
