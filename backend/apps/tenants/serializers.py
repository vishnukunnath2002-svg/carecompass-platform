"""
apps/tenants — Serializers for tenant and subscription management
"""

from rest_framework import serializers
from .models import Tenant, Domain, SubscriptionPlan, TenantSubscription


class DomainSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domain
        fields = ['id', 'domain', 'is_primary']


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class TenantSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=SubscriptionPlan.objects.all(), write_only=True, source='plan'
    )

    class Meta:
        model = TenantSubscription
        fields = ['id', 'tenant', 'plan', 'plan_id', 'status', 'is_trial',
                  'started_at', 'expires_at', 'created_at']
        read_only_fields = ['id', 'tenant', 'started_at', 'created_at']


class TenantSerializer(serializers.ModelSerializer):
    domains = DomainSerializer(many=True, read_only=True)
    subscriptions = TenantSubscriptionSerializer(many=True, read_only=True)
    active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'brand_name', 'type', 'status',
            'contact_email', 'contact_phone', 'website',
            'address_line1', 'address_line2', 'city', 'state', 'pincode',
            'lat', 'lng', 'registration_number', 'gst_number',
            'logo_url', 'branding', 'domain_slug',
            'modules_enabled', 'feature_config',
            'owner_user_id', 'created_at', 'updated_at',
            'domains', 'subscriptions', 'active_subscription',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_active_subscription(self, obj):
        sub = obj.subscriptions.filter(status__in=['active', 'trial']).order_by('-created_at').first()
        if sub:
            return TenantSubscriptionSerializer(sub).data
        return None


class TenantCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating a new tenant."""

    class Meta:
        model = Tenant
        fields = [
            'name', 'brand_name', 'type', 'contact_email', 'contact_phone',
            'city', 'state', 'pincode', 'domain_slug', 'owner_user_id',
        ]

    def validate_domain_slug(self, value):
        if value and Tenant.objects.filter(domain_slug=value).exists():
            raise serializers.ValidationError('This slug is already taken.')
        return value

    def create(self, validated_data):
        # django-tenants requires schema_name (used as the PostgreSQL schema)
        slug = validated_data.get('domain_slug') or validated_data['name'].lower().replace(' ', '_')
        validated_data['schema_name'] = slug
        tenant = Tenant(**validated_data)
        tenant.save()  # triggers auto_create_schema
        # Create a domain entry
        Domain.objects.create(tenant=tenant, domain=f"{slug}.localhost", is_primary=True)
        return tenant


class TenantCurrentSerializer(serializers.ModelSerializer):
    """Used by /api/tenant/subscription/ on the frontend."""
    active_subscription = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'brand_name', 'type', 'status',
            'domain_slug', 'logo_url', 'modules_enabled',
            'contact_email', 'active_subscription',
        ]

    def get_active_subscription(self, obj):
        sub = obj.subscriptions.filter(status__in=['active', 'trial']).order_by('-created_at').first()
        if not sub:
            return None
        return {
            'id': str(sub.id),
            'plan_id': str(sub.plan_id),
            'plan_name': sub.plan.name,
            'status': sub.status,
            'is_trial': sub.is_trial,
            'started_at': sub.started_at,
            'expires_at': sub.expires_at,
            'modules_included': sub.plan.modules_included,
            'max_users': sub.plan.max_users,
            'max_listings': sub.plan.max_listings,
        }
