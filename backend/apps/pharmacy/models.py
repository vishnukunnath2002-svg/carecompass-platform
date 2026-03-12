"""
apps/pharmacy — Prescriptions, partnerships, referrals (TENANT schema)
Maps to: prescriptions, pharmacy_partnerships, pharmacy_referrals
"""

from django.db import models
import uuid


class Prescription(models.Model):
    """Patient-uploaded prescription document."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    patient_profile_id = models.UUIDField(null=True, blank=True)
    file_url = models.URLField()
    doctor_name = models.CharField(max_length=100, null=True, blank=True)
    hospital_name = models.CharField(max_length=255, null=True, blank=True)
    prescribed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verified_by = models.UUIDField(null=True, blank=True)
    reuse_allowed = models.BooleanField(default=False)
    reuse_count = models.IntegerField(default=0)
    max_reuse = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'pharmacy'

    def __str__(self):
        return f"Prescription({self.user_id})"


class PharmacyPartnership(models.Model):
    """Agency-store partnership for medicine sourcing."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('rejected', 'Rejected'),
        ('terminated', 'Terminated'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # agency_tenant_id and store_tenant_id reference public.tenants
    agency_tenant_id = models.UUIDField(db_index=True)
    store_tenant_id = models.UUIDField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'pharmacy'

    def __str__(self):
        return f"Partnership {self.agency_tenant_id} ↔ {self.store_tenant_id}"


class PharmacyReferral(models.Model):
    """Agency referring a patient to a pharmacy store."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('fulfilled', 'Fulfilled'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agency_tenant_id = models.UUIDField(db_index=True)
    store_tenant_id = models.UUIDField(db_index=True)
    partnership = models.ForeignKey(
        PharmacyPartnership, null=True, blank=True, on_delete=models.SET_NULL
    )
    booking_id = models.UUIDField(null=True, blank=True)
    patient_user_id = models.UUIDField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'pharmacy'

    def __str__(self):
        return f"Referral({self.patient_user_id}) - {self.status}"
