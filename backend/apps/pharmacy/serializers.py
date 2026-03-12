from rest_framework import serializers
from .models import Prescription, PharmacyPartnership, PharmacyReferral


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class PharmacyPartnershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyPartnership
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class PharmacyReferralSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacyReferral
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
