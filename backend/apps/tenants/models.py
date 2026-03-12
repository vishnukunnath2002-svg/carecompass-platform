"""
apps/tenants — Tenant model (PUBLIC schema)
Extends django-tenants TenantMixin.
"""

from django.db import models
from django_tenants.models import TenantMixin, DomainMixin
import uuid


class Tenant(TenantMixin):
    """
    Represents a homecare agency, vendor, medical_store, or hospital.
    Each tenant gets its own PostgreSQL schema.
    """

    TENANT_TYPES = [
        ('agency', 'Homecare Agency'),
        ('vendor', 'Medical Vendor'),
        ('medical_store', 'Medical Store'),
        ('hospital', 'Hospital'),
        ('provider', 'Individual Provider'),
    ]

    TENANT_STATUS = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('suspended', 'Suspended'),
        ('deactivated', 'Deactivated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    brand_name = models.CharField(max_length=255, null=True, blank=True)
    type = models.CharField(max_length=20, choices=TENANT_TYPES)
    status = models.CharField(max_length=20, choices=TENANT_STATUS, default='pending')

    # Contact
    contact_email = models.EmailField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    website = models.URLField(null=True, blank=True)

    # Address
    address_line1 = models.CharField(max_length=255, null=True, blank=True)
    address_line2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    # Business
    registration_number = models.CharField(max_length=100, null=True, blank=True)
    gst_number = models.CharField(max_length=20, null=True, blank=True)
    logo_url = models.URLField(null=True, blank=True)
    branding = models.JSONField(default=dict, blank=True)

    # Routing
    domain_slug = models.CharField(max_length=100, unique=True, null=True, blank=True)

    # Feature flags (JSON map: module -> bool)
    modules_enabled = models.JSONField(default=dict, blank=True)
    feature_config = models.JSONField(default=dict, blank=True)

    # Owner
    owner_user_id = models.UUIDField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # django-tenants required: auto-create schema on save
    auto_create_schema = True

    class Meta:
        app_label = 'tenants'

    def __str__(self):
        return f"{self.name} ({self.type})"


class Domain(DomainMixin):
    """Tenant domain (subdomains or custom domains)."""

    class Meta:
        app_label = 'tenants'


class SubscriptionPlan(models.Model):
    """Subscription plans offered on the platform."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    module = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    features = models.JSONField(default=dict)
    modules_included = models.JSONField(default=list, blank=True)

    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    max_users = models.IntegerField(null=True, blank=True)
    max_listings = models.IntegerField(null=True, blank=True)
    commission_override = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_free_trial = models.BooleanField(default=False)
    trial_days = models.IntegerField(null=True, blank=True)
    sort_order = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'tenants'

    def __str__(self):
        return f"{self.name} ({self.module})"


class TenantSubscription(models.Model):
    """Tracks a tenant's active subscription plan."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
        ('trial', 'Trial'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_trial = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'tenants'

    def __str__(self):
        return f"{self.tenant.name} - {self.plan.name}"
