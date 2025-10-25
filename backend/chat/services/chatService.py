from ..models import Conversation, Message, ConversationParticipant
from users.models import User
from workshops.models import Workshop
from django.utils import timezone
from django.db.models import Q
from django.utils import timezone

class ChatService:
    """Service dla zarządzania czatem"""

    @staticmethod
    def get_user_conversations(user):
        """Pobierz wszystkie konwersacje użytkownika"""
        return Conversation.objects.filter(
            Q(client=user) | Q(mechanic=user)
        ).order_by('-last_message_at')

    @staticmethod
    def create_conversation(client, mechanic, workshop, subject, priority='normal', appointment=None):
        """Stwórz nową konwersację"""
        # Sprawdź czy już istnieje aktywna konwersacja między tymi użytkownikami
        existing = Conversation.objects.filter(
            client=client,
            mechanic=mechanic,
            workshop=workshop,
            status__in=['active', 'waiting_client', 'waiting_mechanic']
        ).first()

        if existing:
            return existing

        # Stwórz nową konwersację
        conversation = Conversation.objects.create(
            client=client,
            mechanic=mechanic,
            workshop=workshop,
            subject=subject,
            priority=priority,
            appointment=appointment
        )

        # Dodaj uczestników
        ConversationParticipant.objects.create(
            conversation=conversation,
            user=client
        )
        ConversationParticipant.objects.create(
            conversation=conversation,
            user=mechanic
        )

        return conversation

    @staticmethod
    def send_message(conversation, sender, content, message_type='text', attachment=None, quote_data=None):
        """Wyślij wiadomość w konwersacji"""
        # Sprawdź czy użytkownik ma prawo do pisania w tej konwersacji
        if sender not in [conversation.client, conversation.mechanic]:
            raise PermissionError("User is not participant of this conversation")

        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=content,
            message_type=message_type,
            attachment=attachment,
            quote_data=quote_data
        )

        # Aktualizuj timestamp ostatniej wiadomości
        conversation.last_message_at = timezone.now()
        conversation.save(update_fields=['last_message_at'])

        return message

    @staticmethod
    def mark_messages_as_read(conversation, user):
        """Oznacz wszystkie wiadomości jako przeczytane dla użytkownika"""
        # Oznacz jako przeczytane wiadomości od drugiej osoby
        other_user = conversation.mechanic if user == conversation.client else conversation.client
        
        unread_messages = conversation.messages.filter(
            sender=other_user,
            is_read=False
        )

        updated_count = unread_messages.update(
            is_read=True,
            read_at=timezone.now()
        )

        return updated_count

    @staticmethod
    def get_conversation_by_uuid(conversation_uuid, user):
        """Pobierz konwersację po UUID sprawdzając uprawnienia"""
        try:
            conversation = Conversation.objects.get(uuid=conversation_uuid)
            
            # Sprawdź czy użytkownik ma dostęp
            if user not in [conversation.client, conversation.mechanic]:
                raise PermissionError("User does not have access to this conversation")
                
            return conversation
        except Conversation.DoesNotExist:
            raise ValueError("Conversation not found")

    @staticmethod
    def update_typing_status(conversation, user, is_typing):
        """Aktualizuj status pisania użytkownika"""
        participant = ConversationParticipant.objects.get(
            conversation=conversation,
            user=user
        )
        participant.is_typing = is_typing
        participant.save(update_fields=['is_typing'])

    @staticmethod
    def update_last_seen(conversation, user):
        """Aktualizuj czas ostatniej aktywności użytkownika"""
        participant = ConversationParticipant.objects.get(
            conversation=conversation,
            user=user
        )
        participant.update_last_seen()

    @staticmethod
    def close_conversation(conversation, closed_by):
        """Zamknij konwersację"""
        if closed_by not in [conversation.client, conversation.mechanic]:
            raise PermissionError("User cannot close this conversation")

        conversation.status = 'closed'
        conversation.closed_at = timezone.now()
        conversation.save(update_fields=['status', 'closed_at'])

        # Dodaj systemową wiadomość o zamknięciu
        closed_by_name = f"{closed_by.first_name} {closed_by.last_name}".strip()
        if not closed_by_name:
            closed_by_name = closed_by.username
            
        ChatService.send_message(
            conversation=conversation,
            sender=closed_by,
            content=f"Konwersacja została zamknięta przez {closed_by_name}",
            message_type='system'
        )

        return conversation

    @staticmethod
    def get_unread_count_for_user(user):
        """Pobierz całkowitą liczbę nieprzeczytanych wiadomości dla użytkownika"""
        conversations = ChatService.get_user_conversations(user)
        total_unread = 0
        
        for conversation in conversations:
            if user == conversation.client:
                total_unread += conversation.unread_count_client
            else:
                total_unread += conversation.unread_count_mechanic
                
        return total_unread

    @staticmethod
    def search_conversations(user, query):
        """Wyszukaj konwersacje użytkownika"""
        conversations = ChatService.get_user_conversations(user)
        
        if query:
            conversations = conversations.filter(
                Q(subject__icontains=query) |
                Q(messages__content__icontains=query)
            ).distinct()
            
        return conversations