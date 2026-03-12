from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvoiceViewSet, PayoutViewSet, WalletTransactionViewSet,
    CommissionRuleViewSet, DisputeViewSet, PromoCodeViewSet, ReviewViewSet
)

router = DefaultRouter()
router.register('invoices', InvoiceViewSet, basename='invoices')
router.register('payouts', PayoutViewSet, basename='payouts')
router.register('wallet', WalletTransactionViewSet, basename='wallet')
router.register('commissions', CommissionRuleViewSet, basename='commissions')
router.register('disputes', DisputeViewSet, basename='disputes')
router.register('promos', PromoCodeViewSet, basename='promos')
router.register('reviews', ReviewViewSet, basename='reviews')

urlpatterns = [path('', include(router.urls))]
