"""
apps/hospital — Hospital procurement (TENANT schema)
Maps to: hospital_profiles, hospital_rfqs, hospital_quotes, purchase_orders
"""

from django.db import models
import uuid


class HospitalProfile(models.Model):
    """Hospital-specific onboarding profile."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hospital_name = models.CharField(max_length=255)
    contact_person_name = models.CharField(max_length=100, null=True, blank=True)
    contact_person_role = models.CharField(max_length=100, null=True, blank=True)
    accounts_email = models.EmailField(null=True, blank=True)
    billing_address = models.TextField(null=True, blank=True)
    registration_certificate = models.URLField(null=True, blank=True)
    payment_preference = models.CharField(max_length=50, null=True, blank=True)
    po_format = models.CharField(max_length=50, null=True, blank=True)
    procurement_enabled = models.BooleanField(default=False)
    nursing_manager = models.BooleanField(default=False)
    discharge_coordination = models.BooleanField(default=False)
    credit_requested = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'hospital'

    def __str__(self):
        return self.hospital_name


class HospitalRFQ(models.Model):
    """Request for quotes from hospital to vendors."""

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
        ('awarded', 'Awarded'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq_number = models.CharField(max_length=50, unique=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    items = models.JSONField(default=list)
    deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_by = models.UUIDField(null=True, blank=True)
    # hospital_tenant_id is implicit (the current tenant schema)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'hospital'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.rfq_number:
            import random
            self.rfq_number = f"RFQ{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"RFQ {self.rfq_number}"


class HospitalQuote(models.Model):
    """Vendor's quote in response to an RFQ."""

    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    rfq = models.ForeignKey(HospitalRFQ, on_delete=models.CASCADE, related_name='quotes')
    vendor_tenant_id = models.UUIDField()
    items = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    delivery_timeline = models.CharField(max_length=100, null=True, blank=True)
    terms = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'hospital'

    def __str__(self):
        return f"Quote for {self.rfq.rfq_number} by {self.vendor_tenant_id}"


class PurchaseOrder(models.Model):
    """Hospital PO issued to a vendor after quote acceptance."""

    STATUS_CHOICES = [
        ('issued', 'Issued'),
        ('acknowledged', 'Acknowledged'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    po_number = models.CharField(max_length=50, unique=True, blank=True)
    vendor_tenant_id = models.UUIDField()
    quote = models.ForeignKey(
        HospitalQuote, null=True, blank=True, on_delete=models.SET_NULL
    )
    items = models.JSONField(default=list)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='issued')
    created_by = models.UUIDField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'hospital'

    def save(self, *args, **kwargs):
        if not self.po_number:
            import random
            self.po_number = f"PO{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"PO {self.po_number}"
