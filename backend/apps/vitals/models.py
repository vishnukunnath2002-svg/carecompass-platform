"""
apps/vitals — Vitals logging (TENANT schema)
Maps to: vitals_logs
"""

from django.db import models
import uuid


class VitalLog(models.Model):
    """Vitals recorded by a caregiver during a home visit."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_id = models.UUIDField(db_index=True)
    provider_id = models.UUIDField(db_index=True)
    patient_profile_id = models.UUIDField(null=True, blank=True)

    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    pulse_rate = models.IntegerField(null=True, blank=True)
    oxygen_saturation = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_sugar = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'vitals'
        ordering = ['-recorded_at']

    def __str__(self):
        return f"VitalLog({self.booking_id}) @ {self.recorded_at}"
