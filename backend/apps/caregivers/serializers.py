"""apps/caregivers — Serializers, Views, URLs"""

# ── serializers.py content ──────────────────────────────────────────────────
from rest_framework import serializers
from .models import CaregiverProfile, SpecializationTag


class SpecializationTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpecializationTag
        fields = '__all__'


class CaregiverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaregiverProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'rating', 'review_count']
