"""
apps/tenants — Views for super admin tenant management
"""

from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Tenant, SubscriptionPlan, TenantSubscription
from .serializers import (
    TenantSerializer, TenantCreateSerializer,
    SubscriptionPlanSerializer, TenantSubscriptionSerializer,
    TenantCurrentSerializer,
)


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_superuser or
            request.user.roles.filter(role='super_admin').exists()
        )


class TenantViewSet(viewsets.ModelViewSet):
    """
    Super admin: Full CRUD for tenants.
    GET/POST  /api/admin/tenants/
    GET/PUT/PATCH/DELETE  /api/admin/tenants/{id}/
    """
    permission_classes = [IsSuperAdmin]
    queryset = Tenant.objects.all().prefetch_related('domains', 'subscriptions__plan')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'status']
    search_fields = ['name', 'contact_email', 'domain_slug', 'city']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        return TenantSerializer

    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        tenant = self.get_object()
        tenant.status = 'suspended'
        tenant.save()
        return Response({'status': 'suspended'})

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        tenant = self.get_object()
        tenant.status = 'active'
        tenant.save()
        return Response({'status': 'active'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        tenant = self.get_object()
        tenant.status = 'deactivated'
        tenant.save()
        return Response({'status': 'deactivated'})

    @action(detail=True, methods=['post'], url_path='enable-module')
    def enable_module(self, request, pk=None):
        tenant = self.get_object()
        module = request.data.get('module')
        if not module:
            return Response({'error': 'module required'}, status=400)
        modules = tenant.modules_enabled or {}
        modules[module] = True
        tenant.modules_enabled = modules
        tenant.save()
        return Response({'modules_enabled': modules})

    @action(detail=True, methods=['post'], url_path='disable-module')
    def disable_module(self, request, pk=None):
        tenant = self.get_object()
        module = request.data.get('module')
        if not module:
            return Response({'error': 'module required'}, status=400)
        modules = tenant.modules_enabled or {}
        modules[module] = False
        tenant.modules_enabled = modules
        tenant.save()
        return Response({'modules_enabled': modules})

    @action(detail=True, methods=['post'], url_path='assign-plan')
    def assign_plan(self, request, pk=None):
        tenant = self.get_object()
        plan_id = request.data.get('plan_id')
        is_trial = request.data.get('is_trial', False)
        expires_at = request.data.get('expires_at')
        try:
            plan = SubscriptionPlan.objects.get(pk=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=404)
        # Deactivate existing subscriptions
        tenant.subscriptions.filter(status='active').update(status='expired')
        sub = TenantSubscription.objects.create(
            tenant=tenant,
            plan=plan,
            is_trial=is_trial,
            expires_at=expires_at,
            status='trial' if is_trial else 'active',
        )
        return Response(TenantSubscriptionSerializer(sub).data)


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    """
    Super admin: manage subscription plans.
    GET/POST /api/admin/plans/
    """
    permission_classes = [IsSuperAdmin]
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    ordering = ['sort_order', 'name']


# ─── Tenant-scope view (used by frontend /api/tenant/subscription/) ─────────

class TenantCurrentView(viewsets.GenericViewSet):
    """
    GET /api/tenant/info/
    Returns current tenant info + subscription for logged-in user.
    Replaces the useTenantSubscription Supabase hook.
    """
    serializer_class = TenantCurrentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='info')
    def info(self, request):
        user = request.user
        # Find tenant via user roles
        role = user.roles.filter(tenant_id__isnull=False).first()
        if not role:
            return Response({'detail': 'No tenant associated.'}, status=204)
        try:
            tenant = Tenant.objects.get(pk=role.tenant_id)
        except Tenant.DoesNotExist:
            return Response({'detail': 'Tenant not found.'}, status=404)
        serializer = TenantCurrentSerializer(tenant)
        return Response(serializer.data)
