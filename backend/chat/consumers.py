import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Conversation, Message, ConversationParticipant
from .services import ChatService, NotificationService, MessageValidationService
from .serializers import MessageSerializer, ConversationSerializer

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer dla czatu real-time"""

    async def connect(self):
        """Połączenie WebSocket"""
        self.conversation_uuid = self.scope['url_route']['kwargs']['conversation_uuid']
        self.room_group_name = f'chat_{self.conversation_uuid}'
        self.user = self.scope['user']

        # Sprawdź czy użytkownik jest zalogowany
        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return

        # Sprawdź czy użytkownik ma dostęp do konwersacji
        try:
            self.conversation = await self.get_conversation()
            if not self.conversation:
                await self.close(code=4004)
                return
        except Exception as e:
            logger.error(f"Error getting conversation: {e}")
            await self.close(code=4004)
            return

        # Dołącz do grupy konwersacji
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Aktualizuj status ostatniej aktywności
        await self.update_last_seen()

        # Wyślij informację o dołączeniu użytkownika
        user_name = f"{self.user.first_name} {self.user.last_name}".strip()
        if not user_name:
            user_name = self.user.username
            
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': self.user.id,
                'user_name': user_name
            }
        )

    async def disconnect(self, close_code):
        """Rozłączenie WebSocket"""
        if hasattr(self, 'room_group_name'):
            # Aktualizuj status pisania na false
            await self.update_typing_status(False)
            
            # Wyślij informację o opuszczeniu
            user_name = f"{self.user.first_name} {self.user.last_name}".strip()
            if not user_name:
                user_name = self.user.username
                
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': self.user.id,
                    'user_name': user_name
                }
            )

            # Opuść grupę
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Otrzymaj wiadomość od klienta"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'mark_read':
                await self.handle_mark_read(data)
            elif message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            else:
                logger.warning(f"Unknown message type: {message_type}")

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error in receive: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_chat_message(self, data):
        """Obsłuż wiadomość czatu"""
        try:
            content = data.get('content', '').strip()
            quote_data = data.get('quote_data')
            
            if not content:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Message content cannot be empty'
                }))
                return

            # Waliduj wiadomość
            await self.validate_message(content)

            # Stwórz wiadomość
            message = await self.create_message(content, quote_data)
            
            # Serializuj wiadomość
            message_data = await self.serialize_message(message)

            # Wyślij do grupy
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_broadcast',
                    'message': message_data
                }
            )

            # Wyślij powiadomienie
            await self.send_notification(message)

        except Exception as e:
            logger.error(f"Error handling chat message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(e)
            }))

    async def handle_typing(self, data):
        """Obsłuż status pisania"""
        is_typing = data.get('is_typing', False)
        
        await self.update_typing_status(is_typing)
        
        # Wyślij status pisania do innych w grupie
        user_name = f"{self.user.first_name} {self.user.last_name}".strip()
        if not user_name:
            user_name = self.user.username
            
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_status',
                'user_id': self.user.id,
                'user_name': user_name,
                'is_typing': is_typing
            }
        )

    async def handle_mark_read(self, data):
        """Oznacz wiadomości jako przeczytane"""
        count = await self.mark_messages_read()
        
        await self.send(text_data=json.dumps({
            'type': 'messages_marked_read',
            'count': count
        }))

    # Metody broadcastowe (wywoływane przez group_send)

    async def chat_message_broadcast(self, event):
        """Broadcast wiadomości czatu"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def typing_status(self, event):
        """Broadcast statusu pisania"""
        # Nie wysyłaj swojego własnego statusu pisania
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))

    async def user_joined(self, event):
        """Broadcast dołączenia użytkownika"""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_joined',
                'user_id': event['user_id'],
                'user_name': event['user_name']
            }))

    async def user_left(self, event):
        """Broadcast opuszczenia przez użytkownika"""
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_left',
                'user_id': event['user_id'],
                'user_name': event['user_name']
            }))

    # Metody pomocnicze

    @database_sync_to_async
    def get_conversation(self):
        """Pobierz konwersację i sprawdź uprawnienia"""
        try:
            return ChatService.get_conversation_by_uuid(self.conversation_uuid, self.user)
        except (ValueError, PermissionError):
            return None

    @database_sync_to_async
    def validate_message(self, content):
        """Waliduj treść wiadomości"""
        return MessageValidationService.validate_message_content(content)

    @database_sync_to_async
    def create_message(self, content, quote_data=None):
        """Stwórz nową wiadomość"""
        return ChatService.send_message(
            conversation=self.conversation,
            sender=self.user,
            content=content,
            quote_data=quote_data
        )

    @database_sync_to_async
    def serialize_message(self, message):
        """Serializuj wiadomość"""
        serializer = MessageSerializer(message, context={'user': self.user})
        return serializer.data

    @database_sync_to_async
    def update_typing_status(self, is_typing):
        """Aktualizuj status pisania"""
        return ChatService.update_typing_status(self.conversation, self.user, is_typing)

    @database_sync_to_async
    def update_last_seen(self):
        """Aktualizuj czas ostatniej aktywności"""
        return ChatService.update_last_seen(self.conversation, self.user)

    @database_sync_to_async
    def mark_messages_read(self):
        """Oznacz wiadomości jako przeczytane"""
        return ChatService.mark_messages_as_read(self.conversation, self.user)

    @database_sync_to_async
    def send_notification(self, message):
        """Wyślij powiadomienie o nowej wiadomości"""
        try:
            NotificationService.notify_new_message(message)
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")


class ChatNotificationConsumer(AsyncWebsocketConsumer):
    """Consumer dla powiadomień czatu (globalne dla użytkownika)"""

    async def connect(self):
        """Połączenie WebSocket dla powiadomień"""
        self.user = self.scope['user']

        if isinstance(self.user, AnonymousUser):
            await self.close(code=4001)
            return

        self.user_group_name = f'user_notifications_{self.user.id}'

        # Dołącz do grupy powiadomień użytkownika
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()

        # Wyślij aktualne statystyki nieprzeczytanych wiadomości
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))

    async def disconnect(self, close_code):
        """Rozłączenie WebSocket powiadomień"""
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Obsługa wiadomości od klienta"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'get_unread_count':
                unread_count = await self.get_unread_count()
                await self.send(text_data=json.dumps({
                    'type': 'unread_count',
                    'count': unread_count
                }))

        except json.JSONDecodeError:
            pass  # Ignoruj błędne JSON

    async def new_message_notification(self, event):
        """Otrzymaj powiadomienie o nowej wiadomości"""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'conversation_uuid': event['conversation_uuid'],
            'sender_name': event['sender_name'],
            'content_preview': event['content_preview']
        }))

    async def unread_count_update(self, event):
        """Aktualizacja liczby nieprzeczytanych"""
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': event['count']
        }))

    @database_sync_to_async
    def get_unread_count(self):
        """Pobierz liczbę nieprzeczytanych wiadomości"""
        return ChatService.get_unread_count_for_user(self.user)