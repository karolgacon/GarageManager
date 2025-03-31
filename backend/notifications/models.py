from django.db import models
from users.models import User

class Notification(models.Model):
    CHANNEL_CHOICES = [
        ('email', 'E-mail'),
        ('sms', 'SMS'),
        ('push', 'Powiadomienie push')
    ]

    NOTIFICATION_TYPES = [
        ('appointment_reminder', 'Przypomnienie o wizycie'),
        ('repair_status', 'Status naprawy'),
        ('invoice', 'Faktura'),
        ('promotional', 'Promocyjna'),
        ('system', 'Systemowa')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    read_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='email')
    related_object_id = models.IntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return f"Powiadomienie dla {self.user.username} - {self.notification_type}"

class AuditLog(models.Model):
    ACTION_TYPES = [
        ('create', 'Utworzenie'),
        ('update', 'Aktualizacja'),
        ('delete', 'Usunięcie')
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    table_name = models.CharField(max_length=50)
    record_id = models.IntegerField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.action_type} w {self.table_name} przez {self.user}"