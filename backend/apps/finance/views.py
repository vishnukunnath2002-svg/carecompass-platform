from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Invoice, Payout, WalletTransaction, CommissionRule, Dispute, PromoCode, Review
from .serializers import (
    InvoiceSerializer, PayoutSerializer, WalletTransactionSerializer,
    CommissionRuleSerializer, DisputeSerializer, PromoCodeSerializer, ReviewSerializer
)


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'super_admin' in roles or 'finance_admin' in roles:
            return Invoice.objects.all()
        return Invoice.objects.filter(user_id=user.id)


class PayoutViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PayoutSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'type']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'super_admin' in roles or 'finance_admin' in roles:
            return Payout.objects.all()
        return Payout.objects.filter(user_id=user.id)


class WalletTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = WalletTransactionSerializer
    ordering = ['-created_at']

    def get_queryset(self):
        return WalletTransaction.objects.filter(user_id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        last = WalletTransaction.objects.filter(user_id=request.user.id).first()
        return Response({'balance': last.balance_after if last else 0})


class CommissionRuleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = CommissionRule.objects.all()
    serializer_class = CommissionRuleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active', 'type']


class DisputeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DisputeSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'dispute_type']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'super_admin' in roles or 'support_agent' in roles:
            return Dispute.objects.all()
        return Dispute.objects.filter(user_id=user.id)

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)


class PromoCodeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PromoCode.objects.all()
    serializer_class = PromoCodeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active']
    search_fields = ['code']


class ReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['target_type', 'rating', 'is_verified']
    ordering = ['-created_at']

    def get_queryset(self):
        target_id = self.request.query_params.get('target_id')
        target_type = self.request.query_params.get('target_type')
        qs = Review.objects.all()
        if target_id:
            qs = qs.filter(target_id=target_id)
        if target_type:
            qs = qs.filter(target_type=target_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)
