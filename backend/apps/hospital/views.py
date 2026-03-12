from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import HospitalProfile, HospitalRFQ, HospitalQuote, PurchaseOrder
from .serializers import HospitalProfileSerializer, HospitalRFQSerializer, HospitalQuoteSerializer, PurchaseOrderSerializer


class HospitalProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = HospitalProfile.objects.all()
    serializer_class = HospitalProfileSerializer


class HospitalRFQViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = HospitalRFQ.objects.all()
    serializer_class = HospitalRFQSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering = ['-created_at']


class HospitalQuoteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = HospitalQuote.objects.all()
    serializer_class = HospitalQuoteSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'rfq']


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
