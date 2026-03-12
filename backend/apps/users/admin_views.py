"""
Admin views for super admin user management.
"""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import CustomUser, UserRole
from .serializers import UserSerializer


class IsSuperAdmin(permissions.BasePermission):
    """Only allow super_admin role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.roles.filter(
            role='super_admin'
        ).exists()


class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Super admin: list all platform users and manage roles.
    GET /api/admin/users/
    """
    permission_classes = [IsSuperAdmin]
    queryset = CustomUser.objects.all().select_related('profile').prefetch_related('roles')
    serializer_class = UserSerializer
    search_fields = ['email', 'full_name', 'phone']
    ordering_fields = ['created_at', 'email']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'], url_path='assign-role')
    def assign_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        tenant_id = request.data.get('tenant_id')
        if not role:
            return Response({'error': 'role is required'}, status=400)
        obj, created = UserRole.objects.get_or_create(
            user=user, role=role, tenant_id=tenant_id
        )
        return Response({'created': created, 'role': role})

    @action(detail=True, methods=['post'], url_path='revoke-role')
    def revoke_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        tenant_id = request.data.get('tenant_id')
        UserRole.objects.filter(user=user, role=role, tenant_id=tenant_id).delete()
        return Response({'detail': 'Role revoked.'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'detail': 'User deactivated.'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'detail': 'User activated.'})
