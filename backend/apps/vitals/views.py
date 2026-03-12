from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import VitalLog
from .serializers import VitalLogSerializer


class VitalLogViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = VitalLogSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['booking_id', 'provider_id', 'patient_profile_id']
    ordering = ['-recorded_at']

    def get_queryset(self):
        return VitalLog.objects.all()

    def perform_create(self, serializer):
        serializer.save(provider_id=self.request.user.id)
