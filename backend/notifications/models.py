from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Notification(models.Model):
    CHANNEL_CHOICES = [
        ('email', 'E-mail'),
        ('sms', 'SMS'),
        ('push', 'Powiadomienie push'),
        ('queue', 'Kolejka')
    ]

    NOTIFICATION_TYPES = [
        ('appointment_reminder', 'Przypomnienie o wizycie'),
        ('repair_status', 'Status naprawy'),
        ('invoice', 'Faktura'),
        ('promotional', 'Promocyjna'),
        ('system', 'Systemowa'),
        ('service_reminder', 'Przypomnienie o serwisie'),
        ('chat_message', 'Nowa wiadomość'),
        ('ai_diagnosis_ready', 'Diagnoza AI gotowa'),
        ('parts_low_stock', 'Niski stan magazynowy'),
        ('supplier_delivery', 'Dostawa od dostawcy'),
        ('payment_reminder', 'Przypomnienie o płatności'),
        ('service_feedback_request', 'Prośba o opinię'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    read_status = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='email')
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Niski'),
            ('medium', 'Średni'),
            ('high', 'Wysoki'),
            ('urgent', 'Pilny')
        ],
        default='medium'
    )
    action_url = models.URLField(null=True, blank=True)
    related_object_id = models.IntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, null=True, blank=True)
    processed = models.BooleanField(default=False)
    queue_message_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Powiadomienie dla {self.user.username} - {self.notification_type}"
    
    def mark_as_read(self):
        """Oznacz notyfikację jako przeczytaną"""
        from django.utils import timezone
        self.read_status = True
        self.read_at = timezone.now()
        self.save(update_fields=['read_status', 'read_at'])
    
    @property
    def is_urgent(self):
        """Sprawdź czy notyfikacja jest pilna"""
        return self.priority in ['high', 'urgent']

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

    def __str__(self):
        return f"{self.action_type} w {self.table_name} przez {self.user}"