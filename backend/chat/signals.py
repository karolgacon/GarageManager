from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message, Conversation, ConversationParticipant
from .services import NotificationService

@receiver(post_save, sender=Conversation)
def conversation_created_handler(sender, instance, created, **kwargs):
    """Handler dla nowych konwersacji - automatycznie dodaj uczestników"""
    if created:
        # Automatycznie utwórz uczestników konwersacji
        ConversationParticipant.objects.get_or_create(
            conversation=instance,
            user=instance.client,
            defaults={'notifications_enabled': True}
        )
        ConversationParticipant.objects.get_or_create(
            conversation=instance,
            user=instance.mechanic,
            defaults={'notifications_enabled': True}
        )

@receiver(post_save, sender=Message)
def message_created_handler(sender, instance, created, **kwargs):
    """Handler dla nowych wiadomości"""
    if created:
        # Wyślij powiadomienie o nowej wiadomości
        try:
            NotificationService.notify_new_message(instance)
        except Exception as e:
            # Log błąd ale nie przerywaj procesu
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send message notification: {e}")