"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django_asgi_app = get_asgi_application()

from notifications.routing import websocket_urlpatterns as notifications_patterns
from chat.routing import websocket_urlpatterns as chat_patterns
from chat.middleware import JWTAuthMiddlewareStack

all_websocket_patterns = notifications_patterns + chat_patterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(
            all_websocket_patterns
        )
    ),
})
