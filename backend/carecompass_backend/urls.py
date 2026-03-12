"""URL configuration — TENANT schemas (default)"""

from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Auth (JWT — accessible from all schemas)
    path('api/auth/', include('apps.users.urls.auth_urls')),

    # Tenant-scoped APIs
    path('api/caregivers/', include('apps.caregivers.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/services/', include('apps.services.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/marketplace/', include('apps.marketplace.urls')),
    path('api/pharmacy/', include('apps.pharmacy.urls')),
    path('api/hospital/', include('apps.hospital.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/finance/', include('apps.finance.urls')),
    path('api/vitals/', include('apps.vitals.urls')),
    path('api/tenant/', include('apps.tenants.urls.tenant_urls')),

    # OpenAPI docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
