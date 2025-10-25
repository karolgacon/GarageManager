from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from django.shortcuts import get_object_or_404

from ..models import Conversation, Message
from ..serializers import (
    ConversationSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer
)
from ..services import ChatService, MessageValidationService
from users.models import User
from workshops.models import Workshop

class ConversationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class MessagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200

class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet dla konwersacji"""
    
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = ConversationPagination

    def get_queryset(self):
        """Pobierz konwersacje użytkownika"""
        return ChatService.get_user_conversations(self.request.user)

    def get_serializer_class(self):
        """Wybierz odpowiedni serializer"""
        if self.action == 'create':
            return ConversationCreateSerializer
        return ConversationSerializer

    def get_serializer_context(self):
        """Dodaj użytkownika do kontekstu"""
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context

    def create(self, request):
        """Stwórz nową konwersację"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Pobierz mechanika i warsztat
            mechanic = get_object_or_404(User, id=serializer.validated_data['mechanic_id'])
            workshop = get_object_or_404(Workshop, id=serializer.validated_data['workshop_id'])
            
            # Stwórz konwersację
            conversation = ChatService.create_conversation(
                client=request.user,
                mechanic=mechanic,
                workshop=workshop,
                subject=serializer.validated_data['subject'],
                priority=serializer.validated_data.get('priority', 'normal'),
                appointment=serializer.validated_data.get('appointment')
            )
            
            response_serializer = ConversationSerializer(
                conversation, 
                context={'user': request.user}
            )
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Zamknij konwersację"""
        conversation = self.get_object()
        
        try:
            ChatService.close_conversation(conversation, request.user)
            return Response({'status': 'conversation closed'})
        except PermissionError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Oznacz wszystkie wiadomości jako przeczytane"""
        conversation = self.get_object()
        
        count = ChatService.mark_messages_as_read(conversation, request.user)
        return Response({'marked_count': count})

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Wyszukaj konwersacje"""
        query = request.query_params.get('q', '')
        conversations = ChatService.search_conversations(request.user, query)
        
        page = self.paginate_queryset(conversations)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(conversations, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Pobierz liczbę nieprzeczytanych wiadomości"""
        count = ChatService.get_unread_count_for_user(request.user)
        return Response({'unread_count': count})

class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet dla wiadomości"""
    
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MessagePagination
    
    def get_queryset(self):
        """Pobierz wiadomości z konwersacji"""
        conversation_uuid = self.kwargs.get('conversation_uuid')
        
        try:
            conversation = ChatService.get_conversation_by_uuid(
                conversation_uuid, 
                self.request.user
            )
            return conversation.messages.order_by('-created_at')
        except (ValueError, PermissionError):
            return Message.objects.none()

    def get_serializer_class(self):
        """Wybierz odpowiedni serializer"""
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer

    def get_serializer_context(self):
        """Dodaj użytkownika do kontekstu"""
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context

    def create(self, request, conversation_uuid=None):
        """Wyślij nową wiadomość"""
        try:
            conversation = ChatService.get_conversation_by_uuid(
                conversation_uuid, 
                request.user
            )
        except (ValueError, PermissionError) as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Waliduj treść wiadomości
            MessageValidationService.validate_message_content(
                serializer.validated_data['content']
            )
            
            # Wyślij wiadomość
            message = ChatService.send_message(
                conversation=conversation,
                sender=request.user,
                content=serializer.validated_data['content'],
                message_type=serializer.validated_data.get('message_type', 'text'),
                attachment=serializer.validated_data.get('attachment'),
                quote_data=serializer.validated_data.get('quote_data')
            )
            
            response_serializer = MessageSerializer(
                message, 
                context={'user': request.user}
            )
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def history(self, request, conversation_uuid=None):
        """Pobierz historię wiadomości z paginacją"""
        queryset = self.get_queryset()
        
        # Filtrowanie po dacie
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        # Filtrowanie po typie wiadomości
        message_type = request.query_params.get('type')
        if message_type:
            queryset = queryset.filter(message_type=message_type)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)