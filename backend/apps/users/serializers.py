"""
apps/users — Serializers for auth flow and user management
"""

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, UserRole, Profile


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(
        required=False, default='patient',
        choices=[r[0] for r in [
            ('patient', 'Patient'), ('provider', 'Provider'),
            ('agency_admin', 'Agency Admin'), ('vendor_admin', 'Vendor Admin'),
            ('store_admin', 'Store Admin'), ('hospital_admin', 'Hospital Admin'),
        ]]
    )
    tenant_id = serializers.UUIDField(required=False, allow_null=True)

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'patient')
        tenant_id = validated_data.pop('tenant_id', None)
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone=validated_data.get('phone', ''),
        )
        Profile.objects.create(user=user)
        UserRole.objects.create(user=user, role=role, tenant_id=tenant_id)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get('request'),
            username=attrs['email'],
            password=attrs['password'],
        )
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is deactivated.')
        attrs['user'] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['avatar_url', 'date_of_birth', 'gender']


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ['id', 'role', 'tenant_id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    roles = UserRoleSerializer(many=True, read_only=True)
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'phone', 'is_active', 'created_at', 'roles', 'profile']
        read_only_fields = ['id', 'email', 'created_at']


class UserMeSerializer(serializers.ModelSerializer):
    """Used by /api/auth/me/ — returns full user info with roles and tenant data."""

    roles = serializers.SerializerMethodField()
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'full_name', 'phone', 'roles', 'profile']

    def get_roles(self, obj):
        roles = obj.roles.all()
        result = []
        for r in roles:
            entry = {'role': r.role, 'tenant_id': str(r.tenant_id) if r.tenant_id else None}
            # Attach tenant info if available
            if r.tenant_id:
                try:
                    from apps.tenants.models import Tenant
                    tenant = Tenant.objects.get(pk=r.tenant_id)
                    entry['tenant_name'] = tenant.name
                    entry['tenant_slug'] = tenant.domain_slug
                    entry['tenant_type'] = tenant.type
                    entry['tenant_status'] = tenant.status
                except Exception:
                    pass
            result.append(entry)
        return result


class TokenResponseSerializer(serializers.Serializer):
    """Output shape for login/register responses."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserMeSerializer()
