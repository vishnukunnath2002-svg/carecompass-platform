import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "carecompass_backend.settings")
django.setup()

from django.test import Client

c = Client()
try:
    c.defaults['SERVER_NAME'] = 'localhost'
    response = c.post('/django-admin/login/', {
        'username': 'admin@example.com',
        'password': 'admin_pass_1234',
        'next': '/django-admin/'
    })
    
    print("Status code:", response.status_code)
    print("Redirect URL:", response.url if response.status_code in [301, 302] else "No redirect")
except Exception as e:
    import traceback
    traceback.print_exc()
