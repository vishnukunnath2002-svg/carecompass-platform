"""URL configuration — PUBLIC schema (super admin, auth, plans)"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('django-admin/', admin.site.urls),

    # Auth endpoints (public — for login/register/refresh)
    path('api/auth/', include('apps.users.urls.auth_urls')),

    # Super admin tenant & platform management
    path('api/admin/', include('apps.tenants.urls.admin_urls')),
    path('api/admin/users/', include('apps.users.urls.admin_urls')),
    path('api/admin/features/', include('apps.core.urls')),

    # OpenAPI docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
