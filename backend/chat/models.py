from django.db import models
import uuid
from users.models import User
from appointments.models import Appointment
from workshops.models import Workshop

class Conversation(models.Model):
    """Konwersacja między klientem a mechanikiem"""

    # Uczestnicy
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_conversations')
    mechanic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mechanic_conversations')

    # Kontekst
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, null=True, blank=True)
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)
    subject = models.CharField(max_length=200, help_text="Temat rozmowy")

    # Status
    status = models.CharField(max_length=20, choices=[
        ('active', 'Aktywna'),
        ('waiting_client', 'Oczekuje na klienta'),
        ('waiting_mechanic', 'Oczekuje na mechanika'),
        ('resolved', 'Rozwiązana'),
        ('closed', 'Zamknięta')
    ], default='active')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Niski'),
        ('normal', 'Normalny'),
        ('high', 'Wysoki'),
        ('urgent', 'Pilny')
    ], default='normal')

    # Identyfikator UUID dla WebSocket
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        ordering = ['-last_message_at']

    def __str__(self):
        return f"Chat: {self.client.username} - {self.mechanic.username} ({self.subject})"

    @property
    def unread_count_client(self):
        """Liczba nieprzeczytanych wiadomości dla klienta"""
        return self.messages.filter(is_read=False, sender=self.mechanic).count()

    @property
    def unread_count_mechanic(self):
        """Liczba nieprzeczytanych wiadomości dla mechanika"""
        return self.messages.filter(is_read=False, sender=self.client).count()

class Message(models.Model):
    """Wiadomość w konwersacji"""

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)

    # Treść
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=[
        ('text', 'Tekst'),
        ('image', 'Zdjęcie'),
        ('file', 'Plik'),
        ('system', 'Systemowa'),
        ('quote', 'Wycena')
    ], default='text')

    # Załączniki
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    # Metadata dla wyceny
    quote_data = models.JSONField(null=True, blank=True, help_text="Dane wyceny jeśli message_type=quote")

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}..."

    def mark_as_read(self):
        """Oznacz wiadomość jako przeczytaną"""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

class ConversationParticipant(models.Model):
    """Uczestnicy konwersacji z dodatkowymi metadanymi"""

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Status uczestnictwa
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    is_typing = models.BooleanField(default=False)

    # Preferencje
    notifications_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ['conversation', 'user']

    def __str__(self):
        return f"{self.user.username} in {self.conversation.subject}"

    def update_last_seen(self):
        """Aktualizuj czas ostatniej aktywności"""
        from django.utils import timezone
        self.last_seen_at = timezone.now()
        self.save(update_fields=['last_seen_at'])
