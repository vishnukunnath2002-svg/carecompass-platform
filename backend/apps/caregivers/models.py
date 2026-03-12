"""
apps/caregivers — Caregiver profiles (TENANT schema)
Maps to: caregiver_profiles, specialization_tags
"""

from django.db import models
import uuid


class SpecializationTag(models.Model):
    """Reference data for caregiver specializations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'caregivers'

    def __str__(self):
        return self.name


class CaregiverProfile(models.Model):
    """
    Caregiver / nurse / provider profile within a tenant schema.
    user_id references CustomUser in the public schema.
    """

    PROVIDER_TYPES = [
        ('home_nurse', 'Home Nurse'),
        ('specialized_nurse', 'Specialized Nurse'),
        ('caregiver', 'Caregiver'),
        ('baby_care', 'Baby Care'),
        ('companion', 'Companion'),
        ('bystander', 'Bystander'),
        ('domestic_helper', 'Domestic Helper'),
    ]

    VERIFICATION_STATUS = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)  # References public.users.CustomUser
    provider_type = models.CharField(max_length=30, choices=PROVIDER_TYPES)
    verification_status = models.CharField(
        max_length=20, choices=VERIFICATION_STATUS, default='pending'
    )
    is_available = models.BooleanField(default=True)

    # Rates
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    weekly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Profile
    bio = models.TextField(null=True, blank=True)
    years_experience = models.IntegerField(null=True, blank=True)
    qualification = models.CharField(max_length=255, null=True, blank=True)
    registration_number = models.CharField(max_length=100, null=True, blank=True)
    skills = models.JSONField(default=list, blank=True)
    specializations = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)

    # Availability
    available_days = models.JSONField(default=list, blank=True)
    available_hours = models.JSONField(default=dict, blank=True)

    # Location
    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    preferred_areas = models.JSONField(default=list, blank=True)
    travel_radius_km = models.IntegerField(null=True, blank=True)

    # Ratings
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    review_count = models.IntegerField(default=0)

    # Bank
    bank_account_number = models.CharField(max_length=50, null=True, blank=True)
    bank_ifsc = models.CharField(max_length=20, null=True, blank=True)

    # Emergency
    emergency_contact_name = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)

    # Documents (stored as JSON: [{type, url, expiry}])
    documents = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'caregivers'

    def __str__(self):
        return f"CaregiverProfile({self.user_id}) - {self.provider_type}"
