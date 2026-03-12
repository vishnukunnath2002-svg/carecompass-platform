from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import PatientProfile, Address
from .serializers import PatientProfileSerializer, AddressSerializer


class PatientProfileViewSet(viewsets.ModelViewSet):
    """GET/POST /api/patients/  |  GET/PUT/.../api/patients/{id}/"""
    permission_classes = [IsAuthenticated]
    serializer_class = PatientProfileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['gender', 'blood_group']
    search_fields = ['patient_name']

    def get_queryset(self):
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'patient' in roles and 'agency_admin' not in roles and 'super_admin' not in roles:
            return PatientProfile.objects.filter(user_id=user.id)
        return PatientProfile.objects.all()

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)


class AddressViewSet(viewsets.ModelViewSet):
    """GET/POST /api/patients/addresses/  |  GET/PUT/.../api/patients/addresses/{id}/"""
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)
