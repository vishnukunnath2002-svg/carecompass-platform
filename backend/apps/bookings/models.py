"""
apps/bookings — Bookings and service requests (TENANT schema)
Maps to: bookings, booking_status_history, service_requests
"""

from django.db import models
import uuid


class Booking(models.Model):
    """Core booking model — caregiver booking by a patient/customer."""

    BOOKING_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('disputed', 'Disputed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_number = models.CharField(max_length=50, unique=True, blank=True)
    customer_id = models.UUIDField(db_index=True)
    provider_id = models.UUIDField(null=True, blank=True, db_index=True)
    patient_profile_id = models.UUIDField(null=True, blank=True)
    agency_service_id = models.UUIDField(null=True, blank=True)
    service_category_id = models.UUIDField(null=True, blank=True)
    address_id = models.UUIDField(null=True, blank=True)

    service_type = models.CharField(max_length=100, null=True, blank=True)
    shift_type = models.CharField(max_length=50, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    notes = models.TextField(null=True, blank=True)
    patient_condition = models.CharField(max_length=255, null=True, blank=True)
    specialization_required = models.JSONField(default=list, blank=True)

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    payment_status = models.CharField(max_length=50, null=True, blank=True)

    add_ons = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'bookings'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.booking_number:
            import random
            self.booking_number = f"BK{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.booking_number}"


class BookingStatusHistory(models.Model):
    """Audit trail for booking status changes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=20)
    notes = models.TextField(null=True, blank=True)
    changed_by = models.UUIDField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.booking.booking_number} → {self.status}"


class ServiceRequest(models.Model):
    """Patient-initiated service request before a formal booking."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('converted', 'Converted to Booking'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField(db_index=True)
    patient_name = models.CharField(max_length=255)
    patient_phone = models.CharField(max_length=20, null=True, blank=True)
    service_type = models.CharField(max_length=100)
    description = models.TextField()
    patient_condition = models.CharField(max_length=255, null=True, blank=True)
    preferred_start_date = models.DateField(null=True, blank=True)
    preferred_shift = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    agency_notes = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'bookings'
        ordering = ['-created_at']

    def __str__(self):
        return f"ServiceRequest({self.patient_name}) - {self.status}"
