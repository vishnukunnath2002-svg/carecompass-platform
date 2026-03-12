"""
apps/services — Agency services & service categories (TENANT schema)
Maps to: agency_services, service_categories
"""

from django.db import models
import uuid


class ServiceCategory(models.Model):
    """Hierarchical service categories (e.g., Nursing > ICU Nursing)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(null=True, blank=True)
    icon = models.CharField(max_length=100, null=True, blank=True)
    parent = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children'
    )
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'services'

    def __str__(self):
        return self.name


class AgencyService(models.Model):
    """A service offering created by an agency for patients to book."""

    SERVICE_TYPES = [
        ('nursing', 'Nursing'),
        ('physiotherapy', 'Physiotherapy'),
        ('caregiver', 'Caregiver'),
        ('baby_care', 'Baby Care'),
        ('companion', 'Companion'),
        ('domestic', 'Domestic Help'),
        ('medical_equipment', 'Medical Equipment'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    price_hourly = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_daily = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_weekly = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    conditions_served = models.JSONField(default=list, blank=True)
    equipment_suggestions = models.JSONField(default=list, blank=True)
    assigned_staff = models.JSONField(default=list, blank=True)

    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    review_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'services'

    def __str__(self):
        return self.name
