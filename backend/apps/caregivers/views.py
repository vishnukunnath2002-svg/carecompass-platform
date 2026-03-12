"""apps/caregivers — Views and URL config"""

from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import CaregiverProfile, SpecializationTag
from .serializers import CaregiverProfileSerializer, SpecializationTagSerializer


class CaregiverProfileViewSet(viewsets.ModelViewSet):
    """
    GET/POST /api/caregivers/
    GET/PUT/PATCH/DELETE /api/caregivers/{id}/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CaregiverProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['provider_type', 'verification_status', 'is_available']
    search_fields = ['bio', 'qualification']
    ordering_fields = ['rating', 'created_at', 'hourly_rate']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = CaregiverProfile.objects.all()
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'provider' in roles and 'agency_admin' not in roles and 'super_admin' not in roles:
            return qs.filter(user_id=user.id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)


class SpecializationTagViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = SpecializationTag.objects.filter(is_active=True)
    serializer_class = SpecializationTagSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']
