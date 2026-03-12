"""
apps/notifications — Notifications (TENANT schema)
Maps to: notifications
"""

from django.db import models
import uuid


class Notification(models.Model):
    """In-app notification for a user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    title = models.CharField(max_length=255)
    message = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=50, null=True, blank=True)
    link = models.CharField(max_length=500, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        app_label = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} → user:{self.user_id}"
