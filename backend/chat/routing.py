from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Chat WebSocket dla konkretnej konwersacji  
    re_path(r'ws/chat/(?P<conversation_uuid>[0-9a-f-]{8}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{4}-[0-9a-f-]{12})/$', consumers.ChatConsumer.as_asgi()),
    
    # Powiadomienia czatu dla użytkownika
    re_path(r'ws/chat/notifications/$', consumers.ChatNotificationConsumer.as_asgi()),
]