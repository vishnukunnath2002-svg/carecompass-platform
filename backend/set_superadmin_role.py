import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "carecompass_backend.settings")
django.setup()

from apps.users.models import CustomUser, UserRole

try:
    user = CustomUser.objects.get(email='admin@example.com')
    role, created = UserRole.objects.get_or_create(user=user, role='super_admin', tenant_id=None)
    if created:
        print("Created super_admin role for admin@example.com")
    else:
        print("super_admin role already exists for admin@example.com")
except CustomUser.DoesNotExist:
    print("User admin@example.com not found!")
except Exception as e:
    import traceback
    traceback.print_exc()
