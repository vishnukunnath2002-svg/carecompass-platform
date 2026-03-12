"""
apps/patients — Patient profiles and addresses (TENANT schema)
Maps to: patient_profiles, addresses
"""

from django.db import models
import uuid


class PatientProfile(models.Model):
    """Medical profile for a patient, created by patient or family."""

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    patient_name = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    blood_group = models.CharField(max_length=10, null=True, blank=True)

    medical_conditions = models.JSONField(default=list, blank=True)
    current_medications = models.JSONField(default=list, blank=True)
    allergies = models.JSONField(default=list, blank=True)
    special_care_notes = models.TextField(null=True, blank=True)

    emergency_contact_name = models.CharField(max_length=100, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'patients'

    def __str__(self):
        return f"{self.patient_name} (user: {self.user_id})"


class Address(models.Model):
    """User's saved delivery/service address."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    label = models.CharField(max_length=50, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    lat = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'patients'

    def __str__(self):
        return f"{self.label or 'Address'} - {self.city}"
