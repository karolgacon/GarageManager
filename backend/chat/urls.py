from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_collection import ConversationViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversations')

# Nested routing dla wiadomości w konwersacjach
app_name = 'chat'

urlpatterns = [
    # API dla konwersacji
    path('', include(router.urls)),
    
    # API dla wiadomości w konwersacji
    path('conversations/<uuid:conversation_uuid>/messages/', 
         MessageViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='conversation-messages'),
    
    path('conversations/<uuid:conversation_uuid>/messages/<int:pk>/', 
         MessageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), 
         name='conversation-message-detail'),
    
    path('conversations/<uuid:conversation_uuid>/messages/history/', 
         MessageViewSet.as_view({'get': 'history'}), 
         name='conversation-messages-history'),
]