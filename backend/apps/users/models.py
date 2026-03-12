"""
apps/users — Custom User model and roles (PUBLIC schema)
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid


APP_ROLES = [
    ('super_admin', 'Super Admin'),
    ('admin_manager', 'Admin Manager'),
    ('verification_officer', 'Verification Officer'),
    ('finance_admin', 'Finance Admin'),
    ('support_agent', 'Support Agent'),
    ('content_manager', 'Content Manager'),
    ('patient', 'Patient'),
    ('agency_admin', 'Agency Admin'),
    ('agency_ops', 'Agency Ops'),
    ('agency_booking', 'Agency Booking'),
    ('agency_support', 'Agency Support'),
    ('agency_recruiter', 'Agency Recruiter'),
    ('agency_finance', 'Agency Finance'),
    ('provider', 'Provider'),
    ('vendor_admin', 'Vendor Admin'),
    ('vendor_catalogue', 'Vendor Catalogue'),
    ('vendor_inventory', 'Vendor Inventory'),
    ('vendor_orders', 'Vendor Orders'),
    ('vendor_finance', 'Vendor Finance'),
    ('store_admin', 'Store Admin'),
    ('store_counter', 'Store Counter'),
    ('store_inventory', 'Store Inventory'),
    ('store_dispatch', 'Store Dispatch'),
    ('hospital_admin', 'Hospital Admin'),
    ('hospital_procurement', 'Hospital Procurement'),
    ('hospital_discharge', 'Hospital Discharge'),
    ('hospital_nursing', 'Hospital Nursing'),
]


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    """
    Platform-wide user. Auth is handled here in the public schema.
    Tenant association is via UserRole.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    objects = CustomUserManager()

    class Meta:
        app_label = 'users'

    def __str__(self):
        return self.email


class UserRole(models.Model):
    """
    Maps a user to a role, optionally scoped to a tenant.
    Multiple roles per user are supported (e.g., super_admin + agency_admin).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='roles'
    )
    role = models.CharField(max_length=50, choices=APP_ROLES)
    # null for platform-level roles (super_admin)
    tenant_id = models.UUIDField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'users'
        unique_together = ('user', 'role', 'tenant_id')

    def __str__(self):
        return f"{self.user.email} — {self.role}"


class Profile(models.Model):
    """Extended user profile (avatar, DOB, gender)."""

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    avatar_url = models.URLField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'users'

    def __str__(self):
        return f"Profile: {self.user.email}"
