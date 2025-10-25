"""
Custom middleware for JWT authentication in Django Channels WebSocket connections
"""
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token_string):
    """
    Get user from JWT token
    """
    try:
        # Validate and decode the token
        token = AccessToken(token_string)
        user_id = token.payload.get('user_id')
        
        if user_id:
            user = User.objects.get(id=user_id)
            return user
        return AnonymousUser()
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    """
    JWT authentication middleware for WebSocket connections
    """
    
    async def __call__(self, scope, receive, send):
        # Get token from query parameters
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        
        token = None
        if 'token' in query_params:
            token = query_params['token'][0]
        
        # Authenticate user
        if token:
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    """
    Stack that includes JWT authentication middleware
    """
    return JWTAuthMiddleware(inner)