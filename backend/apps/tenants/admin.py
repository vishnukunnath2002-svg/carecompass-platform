from django.contrib import admin
from django_tenants.admin import TenantAdminMixin
from .models import Tenant, Domain, SubscriptionPlan, TenantSubscription

class DomainInline(admin.TabularInline):
    model = Domain
    max_num = 1

@admin.register(Tenant)
class TenantAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('name', 'type', 'schema_name', 'status', 'created_at')
    search_fields = ('name', 'schema_name')
    list_filter = ('type', 'status')
    inlines = [DomainInline]

@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'module', 'price_monthly', 'is_active')
    search_fields = ('name', 'slug')
    list_filter = ('is_active', 'module')

@admin.register(TenantSubscription)
class TenantSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('tenant', 'plan', 'status', 'is_trial')
    search_fields = ('tenant__name', 'plan__name')
    list_filter = ('status', 'is_trial')
