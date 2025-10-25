from rest_framework import serializers
from .models import Conversation, Message, ConversationParticipant
from users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_username',
            'content', 'message_type', 'attachment', 'is_read', 'read_at',
            'created_at', 'edited_at', 'quote_data'
        ]
        read_only_fields = ['id', 'created_at', 'sender_name', 'sender_username']

    def get_sender_name(self, obj):
        """Pobierz pełne imię nadawcy"""
        sender_name = f"{obj.sender.first_name} {obj.sender.last_name}".strip()
        if not sender_name:
            sender_name = obj.sender.username
        return sender_name

    def create(self, validated_data):
        # Automatycznie ustaw nadawcę na aktualnego użytkownika
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)

class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer do tworzenia nowych wiadomości"""
    
    class Meta:
        model = Message
        fields = ['content', 'message_type', 'attachment', 'quote_data']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Message content cannot be empty")
        if len(value) > 2000:
            raise serializers.ValidationError("Message too long (max 2000 characters)")
        return value

class ConversationSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    mechanic_name = serializers.SerializerMethodField()
    workshop_name = serializers.CharField(source='workshop.name', read_only=True)
    
    # Liczba nieprzeczytanych wiadomości dla aktualnego użytkownika
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'uuid', 'client', 'client_name', 'mechanic', 'mechanic_name',
            'workshop', 'workshop_name', 'subject', 'status', 'priority',
            'appointment', 'created_at', 'last_message_at', 'closed_at',
            'unread_count', 'last_message'
        ]
        read_only_fields = ['uuid', 'created_at', 'last_message_at', 'closed_at']

    def get_client_name(self, obj):
        """Pobierz pełne imię klienta"""
        client_name = f"{obj.client.first_name} {obj.client.last_name}".strip()
        if not client_name:
            client_name = obj.client.username
        return client_name

    def get_mechanic_name(self, obj):
        """Pobierz pełne imię mechanika"""
        mechanic_name = f"{obj.mechanic.first_name} {obj.mechanic.last_name}".strip()
        if not mechanic_name:
            mechanic_name = obj.mechanic.username
        return mechanic_name

    def get_unread_count(self, obj):
        """Pobierz liczbę nieprzeczytanych wiadomości dla aktualnego użytkownika"""
        user = self.context.get('user')
        if not user:
            return 0
        
        if user == obj.client:
            # Zlicz nieprzeczytane wiadomości od mechanika
            return obj.messages.filter(sender=obj.mechanic, is_read=False).count()
        elif user == obj.mechanic:
            # Zlicz nieprzeczytane wiadomości od klienta
            return obj.messages.filter(sender=obj.client, is_read=False).count()
        return 0

    def get_last_message(self, obj):
        """Pobierz ostatnią wiadomość"""
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            sender_name = f"{last_msg.sender.first_name} {last_msg.sender.last_name}".strip()
            if not sender_name:
                sender_name = last_msg.sender.username
            
            return {
                'id': last_msg.id,
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'sender_name': sender_name,
                'created_at': last_msg.created_at,
                'message_type': last_msg.message_type
            }
        return None

class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer do tworzenia nowych konwersacji"""
    mechanic_id = serializers.IntegerField(write_only=True)
    workshop_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Conversation
        fields = ['mechanic_id', 'workshop_id', 'subject', 'priority', 'appointment']

    def validate_subject(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Subject cannot be empty")
        if len(value) > 200:
            raise serializers.ValidationError("Subject too long (max 200 characters)")
        return value

class ConversationParticipantSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ConversationParticipant
        fields = [
            'id', 'user', 'user_name', 'user_username',
            'joined_at', 'last_seen_at', 'is_typing', 'notifications_enabled'
        ]
        read_only_fields = ['id', 'joined_at', 'user_name', 'user_username']

    def get_user_name(self, obj):
        """Pobierz pełne imię użytkownika"""
        user_name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        if not user_name:
            user_name = obj.user.username
        return user_name