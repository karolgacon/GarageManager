from ..models import Conversation, Message, ConversationParticipant
from users.models import User
from workshops.models import Workshop
from appointments.models import Appointment
from django.db import transaction
from django.core.exceptions import ValidationError

class NotificationService:
    """Service do wysyłania powiadomień o wiadomościach czatu"""

    @staticmethod
    def notify_new_message(message):
        """Wyślij powiadomienie o nowej wiadomości"""
        conversation = message.conversation
        recipient = conversation.mechanic if message.sender == conversation.client else conversation.client
        
        # Importuj tutaj aby uniknąć circular imports
        from notifications.services.notificationService import NotificationService as BaseNotificationService
        
        try:
            sender_name = f"{message.sender.first_name} {message.sender.last_name}".strip()
            if not sender_name:
                sender_name = message.sender.username
                
            BaseNotificationService.send_notification(
                user=recipient,
                message=f"Nowa wiadomość od {sender_name}: {conversation.subject}",
                notification_type='chat_message',
                channel='email',
                related_object_id=message.id,
                related_object_type='Message'
            )
        except Exception as e:
            # Log błąd ale nie przerywaj procesu wysyłania wiadomości
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send chat notification: {e}")

    @staticmethod 
    def notify_conversation_status_change(conversation, status_change):
        """Powiadom o zmianie statusu konwersacji"""
        from notifications.services.notificationService import NotificationService as BaseNotificationService
        
        recipients = [conversation.client, conversation.mechanic]
        
        status_messages = {
            'closed': 'Konwersacja została zamknięta',
            'waiting_client': 'Oczekuje na odpowiedź klienta',
            'waiting_mechanic': 'Oczekuje na odpowiedź mechanika'
        }
        
        message = status_messages.get(status_change, f'Status zmieniony na: {status_change}')
        
        for recipient in recipients:
            try:
                BaseNotificationService.send_notification(
                    user=recipient,
                    message=message,
                    notification_type='chat_status',
                    channel='email',
                    related_object_id=conversation.id,
                    related_object_type='Conversation'
                )
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to send status notification: {e}")

class ConversationManagementService:
    """Service do zarządzania konwersacjami"""

    @staticmethod
    def assign_mechanic_to_conversation(conversation_uuid, mechanic_id, assigned_by):
        """Przypisz mechanika do konwersacji"""
        try:
            conversation = Conversation.objects.get(uuid=conversation_uuid)
            new_mechanic = User.objects.get(id=mechanic_id, role='mechanic')
            
            # Sprawdź uprawnienia
            if assigned_by.role not in ['admin', 'manager']:
                raise PermissionError("Only admin or manager can assign mechanics")
            
            old_mechanic = conversation.mechanic
            conversation.mechanic = new_mechanic
            conversation.save()
            
            # Aktualizuj uczestników
            ConversationParticipant.objects.filter(
                conversation=conversation,
                user=old_mechanic
            ).delete()
            
            ConversationParticipant.objects.get_or_create(
                conversation=conversation,
                user=new_mechanic
            )
            
            # Wyślij powiadomienie
            NotificationService.notify_conversation_status_change(
                conversation, 
                f'mechanic_assigned_to_{new_mechanic.username}'
            )
            
            return conversation
            
        except User.DoesNotExist:
            raise ValidationError("Mechanic not found")
        except Conversation.DoesNotExist:
            raise ValidationError("Conversation not found")

    @staticmethod
    def escalate_conversation(conversation_uuid, escalated_by, reason):
        """Eskaluj konwersację do managera"""
        try:
            conversation = Conversation.objects.get(uuid=conversation_uuid)
            
            # Sprawdź czy użytkownik może eskalować
            if escalated_by not in [conversation.client, conversation.mechanic]:
                raise PermissionError("User cannot escalate this conversation")
            
            conversation.priority = 'high'
            conversation.save()
            
            # Dodaj systemową wiadomość
            from .chatService import ChatService
            ChatService.send_message(
                conversation=conversation,
                sender=escalated_by,
                content=f"Konwersacja została eskalowana. Powód: {reason}",
                message_type='system'
            )
            
            # Powiadom managerów
            managers = User.objects.filter(role='manager', is_active=True)
            for manager in managers:
                NotificationService.notify_conversation_status_change(
                    conversation,
                    'escalated'
                )
            
            return conversation
            
        except Conversation.DoesNotExist:
            raise ValidationError("Conversation not found")

class MessageValidationService:
    """Service do walidacji wiadomości"""

    @staticmethod
    def validate_message_content(content, message_type='text'):
        """Waliduj treść wiadomości"""
        if not content or not content.strip():
            raise ValidationError("Message content cannot be empty")
        
        if message_type == 'text':
            if len(content) > 2000:
                raise ValidationError("Message too long (max 2000 characters)")
        
        # Podstawowa walidacja na spam/nieodpowiednie treści
        spam_keywords = ['spam', 'viagra', 'casino']
        content_lower = content.lower()
        
        for keyword in spam_keywords:
            if keyword in content_lower:
                raise ValidationError("Message contains inappropriate content")
        
        return True

    @staticmethod
    def validate_attachment(attachment):
        """Waliduj załącznik"""
        if not attachment:
            return True
            
        # Sprawdź rozmiar pliku (max 10MB)
        if attachment.size > 10 * 1024 * 1024:
            raise ValidationError("File too large (max 10MB)")
        
        # Sprawdź typ pliku
        allowed_types = [
            'image/jpeg', 'image/png', 'image/gif',
            'application/pdf', 'text/plain',
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        
        if attachment.content_type not in allowed_types:
            raise ValidationError("File type not allowed")
        
        return True