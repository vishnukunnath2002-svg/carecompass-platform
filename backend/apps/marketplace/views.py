from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, ProductCategory, Order, MedicalStoreProfile, StoreInventoryItem, StoreOrder
from .serializers import (
    ProductSerializer, ProductCategorySerializer, OrderSerializer,
    MedicalStoreProfileSerializer, StoreInventoryItemSerializer, StoreOrderSerializer
)


class ProductCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = ProductCategory.objects.filter(is_active=True)
    serializer_class = ProductCategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_prescription_required', 'is_active']
    search_fields = ['name', 'brand', 'sku']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'patient' in roles and 'vendor_admin' not in roles and 'super_admin' not in roles:
            return Order.objects.filter(customer_id=user.id)
        return Order.objects.all()

    def perform_create(self, serializer):
        serializer.save(customer_id=self.request.user.id)


class MedicalStoreProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = MedicalStoreProfile.objects.all()
    serializer_class = MedicalStoreProfileSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['store_name', 'owner_name']


class StoreInventoryItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StoreInventoryItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'is_prescription_required', 'category']
    search_fields = ['product_name', 'brand']

    def get_queryset(self):
        store_id = self.request.query_params.get('store_id')
        qs = StoreInventoryItem.objects.all()
        if store_id:
            qs = qs.filter(store_id=store_id)
        return qs


class StoreOrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = StoreOrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        roles = list(user.roles.values_list('role', flat=True))
        if 'patient' in roles and 'store_admin' not in roles and 'super_admin' not in roles:
            return StoreOrder.objects.filter(customer_id=user.id)
        return StoreOrder.objects.all()

    def perform_create(self, serializer):
        serializer.save(customer_id=self.request.user.id)
