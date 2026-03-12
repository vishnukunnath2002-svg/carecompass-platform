import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "carecompass_backend.settings")
django.setup()

from django.test import Client
import json

c = Client(SERVER_NAME='localhost', raise_request_exception=False)
try:
    response = c.post('/api/auth/register/', json.dumps({
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User",
        "role": "patient"
    }), content_type="application/json")

    print("Status:", response.status_code)
    if response.status_code >= 400:
        print("Content:", response.content.decode())
except Exception as e:
    import traceback
    traceback.print_exc()
