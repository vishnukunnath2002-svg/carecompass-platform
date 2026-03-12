from rest_framework import serializers
from .models import (
    Product, ProductCategory, Order, OrderItem,
    MedicalStoreProfile, StoreInventoryItem, StoreOrder, StoreOrderItem
)


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'rating', 'review_count']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class MedicalStoreProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalStoreProfile
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class StoreInventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreInventoryItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class StoreOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreOrderItem
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class StoreOrderSerializer(serializers.ModelSerializer):
    items = StoreOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = StoreOrder
        fields = '__all__'
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']
