from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Prescription, PharmacyPartnership, PharmacyReferral
from .serializers import PrescriptionSerializer, PharmacyPartnershipSerializer, PharmacyReferralSerializer


class PrescriptionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PrescriptionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_verified', 'reuse_allowed']
    ordering = ['-created_at']

    def get_queryset(self):
        return Prescription.objects.filter(user_id=self.request.user.id)

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)


class PharmacyPartnershipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PharmacyPartnership.objects.all()
    serializer_class = PharmacyPartnershipSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']


class PharmacyReferralViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PharmacyReferral.objects.all()
    serializer_class = PharmacyReferralSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
