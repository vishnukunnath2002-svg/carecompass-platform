from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, ProductCategoryViewSet, OrderViewSet,
    MedicalStoreProfileViewSet, StoreInventoryItemViewSet, StoreOrderViewSet
)

router = DefaultRouter()
router.register('product-categories', ProductCategoryViewSet, basename='product-categories')
router.register('products', ProductViewSet, basename='products')
router.register('orders', OrderViewSet, basename='orders')
router.register('stores', MedicalStoreProfileViewSet, basename='medical-stores')
router.register('store-inventory', StoreInventoryItemViewSet, basename='store-inventory')
router.register('store-orders', StoreOrderViewSet, basename='store-orders')

urlpatterns = [path('', include(router.urls))]
