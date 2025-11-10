import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Pobierz user_id z URL
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'notifications_{self.user_id}'

        # Sprawdź czy użytkownik jest zalogowany
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        # Sprawdź czy użytkownik ma prawo do tych powiadomień
        if str(self.scope["user"].id) != str(self.user_id):
            await self.close()
            return

        # Dołącz do grupy powiadomień
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Wyślij nieodczytane powiadomienia po połączeniu
        await self.send_unread_notifications()

    async def disconnect(self, close_code):
        # Opuść grupę powiadomień
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')

        if message_type == 'mark_as_read':
            notification_id = text_data_json.get('notification_id')
            await self.mark_notification_as_read(notification_id)
        elif message_type == 'mark_all_as_read':
            await self.mark_all_notifications_as_read()
        elif message_type == 'get_unread_notifications':
            await self.send_unread_notifications()

    async def notification_message(self, event):
        """Handler dla otrzymywania powiadomień z grupy"""
        notification = event['notification']
        
        # Wyślij powiadomienie do WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': notification
        }))

    @database_sync_to_async
    def get_unread_notifications(self):
        """Pobierz nieodczytane powiadomienia dla użytkownika"""
        notifications = Notification.objects.filter(
            user_id=self.user_id,
            read_status=False
        ).order_by('-created_at')[:10]  # Ostatnie 10 nieodczytanych
        
        return [
            {
                'id': notification.id,
                'message': notification.message,
                'notification_type': notification.notification_type,
                'priority': notification.priority,
                'created_at': notification.created_at.isoformat(),
                'action_url': notification.action_url,
            }
            for notification in notifications
        ]

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """Oznacz powiadomienie jako przeczytane"""
        try:
            notification = Notification.objects.get(
                id=notification_id,
                user_id=self.user_id
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False

    @database_sync_to_async
    def mark_all_notifications_as_read(self):
        """Oznacz wszystkie powiadomienia jako przeczytane"""
        Notification.objects.filter(
            user_id=self.user_id,
            read_status=False
        ).update(read_status=True)

    async def send_unread_notifications(self):
        """Wyślij nieodczytane powiadomienia po połączeniu"""
        unread_notifications = await self.get_unread_notifications()
        
        if unread_notifications:
            await self.send(text_data=json.dumps({
                'type': 'unread_notifications',
                'notifications': unread_notifications,
                'count': len(unread_notifications)
            }))

    @classmethod
    async def send_notification_to_user(cls, user_id, notification_data):
        """Statyczna metoda do wysyłania powiadomień do użytkownika"""
        from channels.layers import get_channel_layer
        
        channel_layer = get_channel_layer()
        room_group_name = f'notifications_{user_id}'
        
        await channel_layer.group_send(
            room_group_name,
            {
                'type': 'notification_message',
                'notification': notification_data
            }
        )