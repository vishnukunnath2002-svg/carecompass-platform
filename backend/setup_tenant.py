import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "carecompass_backend.settings")
django.setup()

from apps.tenants.models import Tenant, Domain

try:
    tenant = Tenant.objects.get(schema_name="public")
    print("Public tenant already exists.")
except Tenant.DoesNotExist:
    tenant = Tenant(
        schema_name="public",
        name="CareCompass Public",
        type="agency",
        status="active"
    )
    tenant.save()
    print("Public tenant created.")

try:
    domain = Domain.objects.get(domain="localhost")
    print("localhost domain already exists.")
except Domain.DoesNotExist:
    domain = Domain(
        domain="localhost",
        tenant=tenant,
        is_primary=True
    )
    domain.save()
    print("localhost domain created.")
