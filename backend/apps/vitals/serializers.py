from rest_framework import serializers
from .models import VitalLog


class VitalLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalLog
        fields = '__all__'
        read_only_fields = ['id', 'recorded_at']
