from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PrescriptionViewSet, PharmacyPartnershipViewSet, PharmacyReferralViewSet

router = DefaultRouter()
router.register('prescriptions', PrescriptionViewSet, basename='prescriptions')
router.register('partnerships', PharmacyPartnershipViewSet, basename='pharmacy-partnerships')
router.register('referrals', PharmacyReferralViewSet, basename='pharmacy-referrals')

urlpatterns = [path('', include(router.urls))]
