"""
apps/bookings — Serializers
"""

from rest_framework import serializers
from .models import Booking, BookingStatusHistory, ServiceRequest


class BookingStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingStatusHistory
        fields = ['id', 'status', 'notes', 'changed_by', 'created_at']


class BookingSerializer(serializers.ModelSerializer):
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['id', 'booking_number', 'created_at', 'updated_at']


class ServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
