"""
apps/bookings — ViewSets for bookings and service requests (TENANT schema)
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Booking, BookingStatusHistory, ServiceRequest
from .serializers import BookingSerializer, BookingStatusHistorySerializer, ServiceRequestSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for bookings within current tenant schema.
    GET/POST /api/bookings/
    GET/PUT/PATCH/DELETE /api/bookings/{id}/
    POST /api/bookings/{id}/update-status/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'service_type', 'shift_type', 'payment_status']
    search_fields = ['booking_number', 'patient_condition', 'notes']
    ordering_fields = ['created_at', 'start_date']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Booking.objects.all()
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        # Patients see only their own bookings
        if 'patient' in roles and not any(r in roles for r in ['agency_admin', 'agency_booking', 'super_admin']):
            qs = qs.filter(customer_id=user.id)
        # Providers see bookings assigned to them
        elif 'provider' in roles and not any(r in roles for r in ['agency_admin', 'super_admin']):
            qs = qs.filter(provider_id=user.id)
        return qs

    def perform_create(self, serializer):
        serializer.save(customer_id=self.request.user.id)

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        if not new_status:
            return Response({'error': 'status is required'}, status=400)
        old_status = booking.status
        booking.status = new_status
        booking.save()
        BookingStatusHistory.objects.create(
            booking=booking,
            status=new_status,
            notes=notes,
            changed_by=request.user.id,
        )
        return Response({
            'id': str(booking.id),
            'booking_number': booking.booking_number,
            'old_status': old_status,
            'new_status': new_status,
        })

    @action(detail=True, methods=['get'], url_path='history')
    def status_history(self, request, pk=None):
        booking = self.get_object()
        history = booking.status_history.all()
        return Response(BookingStatusHistorySerializer(history, many=True).data)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    """
    CRUD for patient service requests.
    GET/POST /api/service-requests/
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ServiceRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'service_type']
    search_fields = ['patient_name', 'description']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = ServiceRequest.objects.all()
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'patient' in roles and 'agency_admin' not in roles and 'super_admin' not in roles:
            qs = qs.filter(patient_id=user.id)
        return qs

    def perform_create(self, serializer):
        serializer.save(patient_id=self.request.user.id)
