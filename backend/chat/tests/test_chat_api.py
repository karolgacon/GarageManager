from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

from workshops.models import Workshop
from ..models import Conversation, Message
from ..services import ChatService

User = get_user_model()

class ChatAPITestCase(TestCase):
    def setUp(self):
        """Przygotuj dane testowe"""
        self.client = APIClient()
        
        # Stwórz użytkowników
        self.client_user = User.objects.create_user(
            username='testclient',
            email='client@test.com',
            password='testpass123',
            role='client'
        )
        
        self.mechanic_user = User.objects.create_user(
            username='testmechanic',
            email='mechanic@test.com',
            password='testpass123',
            role='mechanic'
        )
        
        # Stwórz warsztat
        self.workshop = Workshop.objects.create(
            name='Test Workshop',
            contact_email='workshop@test.com',
            contact_phone='+48123456789'
        )

    def test_create_conversation_as_client(self):
        """Test tworzenia konwersacji przez klienta"""
        self.client.force_authenticate(user=self.client_user)
        
        data = {
            'mechanic_id': self.mechanic_user.id,
            'workshop_id': self.workshop.id,
            'subject': 'Problem z silnikiem',
            'priority': 'normal'
        }
        
        response = self.client.post('/api/v1/chat/conversations/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Conversation.objects.count(), 1)
        
        conversation = Conversation.objects.first()
        self.assertEqual(conversation.client, self.client_user)
        self.assertEqual(conversation.mechanic, self.mechanic_user)
        self.assertEqual(conversation.subject, 'Problem z silnikiem')

    def test_get_user_conversations(self):
        """Test pobierania konwersacji użytkownika"""
        # Stwórz konwersację
        conversation = ChatService.create_conversation(
            client=self.client_user,
            mechanic=self.mechanic_user,
            workshop=self.workshop,
            subject='Test conversation'
        )
        
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get('/api/v1/chat/conversations/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['uuid'], str(conversation.uuid))

    def test_send_message(self):
        """Test wysyłania wiadomości"""
        # Stwórz konwersację
        conversation = ChatService.create_conversation(
            client=self.client_user,
            mechanic=self.mechanic_user,
            workshop=self.workshop,
            subject='Test conversation'
        )
        
        self.client.force_authenticate(user=self.client_user)
        
        data = {
            'content': 'Moja pierwsza wiadomość',
            'message_type': 'text'
        }
        
        url = f'/api/v1/chat/conversations/{conversation.uuid}/messages/'
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        
        message = Message.objects.first()
        self.assertEqual(message.content, 'Moja pierwsza wiadomość')
        self.assertEqual(message.sender, self.client_user)

    def test_unauthorized_access(self):
        """Test nieautoryzowanego dostępu"""
        response = self.client.get('/api/v1/chat/conversations/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_conversation_access_control(self):
        """Test kontroli dostępu do konwersacji"""
        # Stwórz konwersację między klientem a mechanikiem
        conversation = ChatService.create_conversation(
            client=self.client_user,
            mechanic=self.mechanic_user,
            workshop=self.workshop,
            subject='Private conversation'
        )
        
        # Stwórz innego użytkownika
        other_user = User.objects.create_user(
            username='other',
            email='other@test.com',
            password='testpass123',
            role='client'
        )
        
        # Próba dostępu przez nieuprawnionego użytkownika
        self.client.force_authenticate(user=other_user)
        url = f'/api/v1/chat/conversations/{conversation.uuid}/messages/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)  # Brak dostępu do wiadomości

class ChatServiceTestCase(TestCase):
    def setUp(self):
        """Przygotuj dane testowe"""
        self.client_user = User.objects.create_user(
            username='testclient',
            email='client@test.com',
            password='testpass123',
            role='client'
        )
        
        self.mechanic_user = User.objects.create_user(
            username='testmechanic',
            email='mechanic@test.com',
            password='testpass123',
            role='mechanic'
        )
        
        self.workshop = Workshop.objects.create(
            name='Test Workshop',
            contact_email='workshop@test.com',
            contact_phone='+48123456789'
        )

    def test_create_conversation_service(self):
        """Test service tworzenia konwersacji"""
        conversation = ChatService.create_conversation(
            client=self.client_user,
            mechanic=self.mechanic_user,
            workshop=self.workshop,
            subject='Service test conversation',
            priority='high'
        )
        
        self.assertIsNotNone(conversation)
        self.assertEqual(conversation.priority, 'high')
        self.assertEqual(conversation.participants.count(), 2)

    def test_send_message_service(self):
        """Test service wysyłania wiadomości"""
        conversation = ChatService.create_conversation(
            client=self.client_user,
            mechanic=self.mechanic_user,
            workshop=self.workshop,
            subject='Test conversation'
        )
        
        message = ChatService.send_message(
            conversation=conversation,
            sender=self.client_user,
            content='Test message content'
        )
        
        self.assertIsNotNone(message)
        self.assertEqual(message.content, 'Test message content')
        self.assertEqual(message.sender, self.client_user)

    def test_mark_messages_as_read(self):
        """Test oznaczania wiadomości jako przeczytane"""
        conversation = ChatService.create_conversation(
            client=self.client_user,
            mechanic=self.mechanic_user,
            workshop=self.workshop,
            subject='Test conversation'
        )
        
        # Mechanik wysyła wiadomość
        ChatService.send_message(
            conversation=conversation,
            sender=self.mechanic_user,
            content='Message from mechanic'
        )
        
        # Klient oznacza jako przeczytane
        count = ChatService.mark_messages_as_read(conversation, self.client_user)
        
        self.assertEqual(count, 1)
        
        # Sprawdź czy wiadomość została oznaczona jako przeczytana
        message = Message.objects.first()
        self.assertTrue(message.is_read)
        self.assertIsNotNone(message.read_at)