from rest_framework import serializers
from .models import HospitalProfile, HospitalRFQ, HospitalQuote, PurchaseOrder


class HospitalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class HospitalRFQSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalRFQ
        fields = '__all__'
        read_only_fields = ['id', 'rfq_number', 'created_at']


class HospitalQuoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalQuote
        fields = '__all__'
        read_only_fields = ['id', 'submitted_at']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ['id', 'po_number', 'created_at']
