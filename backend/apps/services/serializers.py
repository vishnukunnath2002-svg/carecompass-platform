"""apps/services — Serializers, Views, URLs"""

from rest_framework import serializers
from .models import AgencyService, ServiceCategory


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = '__all__'


class AgencyServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgencyService
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'rating', 'review_count']
