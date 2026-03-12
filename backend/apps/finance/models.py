"""
apps/finance — Invoices, payouts, wallet, commissions (TENANT schema)
Maps to: invoices, payouts, wallet_transactions, commission_rules, disputes, promo_codes, reviews
"""

from django.db import models
import uuid


class Invoice(models.Model):
    """Auto-generated invoice for bookings/orders."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    user_id = models.UUIDField(db_index=True)
    reference_id = models.UUIDField()  # booking_id or order_id
    type = models.CharField(max_length=50)  # 'booking', 'order', etc.
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    pdf_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'finance'

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            import random
            self.invoice_number = f"INV{random.randint(100000, 999999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice {self.invoice_number}"


class Payout(models.Model):
    """Payout to caregiver or vendor."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(null=True, blank=True, db_index=True)
    type = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bank_details = models.JSONField(default=dict, blank=True)
    reference_id = models.CharField(max_length=100, null=True, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'finance'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payout {self.id}"


class WalletTransaction(models.Model):
    """Wallet credit/debit log for a user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    type = models.CharField(max_length=20)  # 'credit', 'debit'
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    balance_after = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    source = models.CharField(max_length=50)
    description = models.TextField(null=True, blank=True)
    reference_id = models.CharField(max_length=100, null=True, blank=True)
    reference_type = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'finance'
        ordering = ['-created_at']

    def __str__(self):
        return f"Wallet {self.type} {self.amount} for {self.user_id}"


class CommissionRule(models.Model):
    """Platform commission configuration."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    flat_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'finance'

    def __str__(self):
        return f"{self.name} ({self.percentage}%)"


class Dispute(models.Model):
    """User-raised dispute on a booking or order."""

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    dispute_type = models.CharField(max_length=50)
    subject = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    reference_id = models.UUIDField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    resolved_by = models.UUIDField(null=True, blank=True)
    resolution = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'finance'

    def __str__(self):
        return f"Dispute: {self.subject}"


class PromoCode(models.Model):
    """Promotional discount codes."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    discount_type = models.CharField(max_length=20, null=True, blank=True)  # 'percent', 'flat'
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    usage_count = models.IntegerField(default=0)
    applicable_modules = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'finance'

    def __str__(self):
        return self.code


class Review(models.Model):
    """User review for a caregiver, store, or product."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    target_id = models.UUIDField()
    target_type = models.CharField(max_length=50)  # 'caregiver', 'store', 'product', 'service'
    rating = models.IntegerField()  # 1-5
    title = models.CharField(max_length=255, null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'finance'

    def __str__(self):
        return f"Review({self.target_type}) by {self.user_id}"
