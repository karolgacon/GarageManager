# 🚀 PLAN IMPLEMENTACJI NOWYCH FUNKCJONALNOŚCI

**Data:** 25 października 2025  
**Założenia:** Po wykonaniu poprawek z fixes-plan.md  
**Czas realizacji:** 6 miesięcy  
**Team size:** 1-3 developerów

## 🎯 GŁÓWNE FUNKCJONALNOŚCI DO IMPLEMENTACJI

1. **🤖 AI Chatbot** - Wstępna diagnoza pojazdów
2. **💬 Real-time Chat** - Komunikacja klient-mechanik
3. **🗺️ Geolokalizacja** - Mapa warsztatów i wyszukiwanie
4. **📅 Kalendarz** - System rezerwacji i harmonogramowania
5. **💳 Płatności Online** - Integracja payment gateway
6. **📊 Raporty i Analityka** - Business intelligence
7. **📱 Mobile Features** - PWA i responsywność
8. **🔔 Advanced Notifications** - Smart powiadomienia

---

## 🤖 FAZA 1: AI CHATBOT (Miesiąc 1)

### Cel biznesowy:

Automatyczna wstępna diagnoza problemów z pojazdem przy użyciu AI, która pomoże:

- Zredukować czas mechaników na podstawowe konsultacje
- Zwiększyć satysfakcję klientów (24/7 dostępność)
- Pre-filter poważne vs. drobne problemy
- Generować lead'y dla warsztatów

### 1.1 Backend Implementation

#### Models:

```python
# ai_chat/models.py
class ChatSession(models.Model):
    """Sesja rozmowy z AI chatbotem"""

    # Relacje
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_chat_sessions')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, null=True, blank=True)
    workshop = models.ForeignKey(Workshop, on_delete=models.SET_NULL, null=True, blank=True)

    # Podstawowe dane
    session_id = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Status sesji
    status = models.CharField(max_length=20, choices=[
        ('active', 'Aktywna'),
        ('diagnosis_complete', 'Diagnoza zakończona'),
        ('escalated', 'Przekazana do mechanika'),
        ('closed', 'Zamknięta'),
        ('abandoned', 'Porzucona')
    ], default='active')

    # Metadane
    user_agent = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

class ChatMessage(models.Model):
    """Wiadomość w sesji chatbota"""

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    is_ai_response = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    # AI specyficzne pola
    ai_confidence = models.FloatField(null=True, blank=True)
    ai_model_used = models.CharField(max_length=50, null=True, blank=True)
    processing_time_ms = models.IntegerField(null=True, blank=True)

    # Analiza sentymentu
    sentiment = models.CharField(max_length=20, choices=[
        ('positive', 'Pozytywny'),
        ('neutral', 'Neutralny'),
        ('negative', 'Negatywny'),
        ('frustrated', 'Sfrustrowany')
    ], null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

class AIDiagnosis(models.Model):
    """Diagnoza wygenerowana przez AI"""

    session = models.OneToOneField(ChatSession, on_delete=models.CASCADE, related_name='diagnosis')

    # Input data
    symptoms_collected = models.JSONField(help_text="Zebrane objawy w strukturze JSON")
    vehicle_data = models.JSONField(help_text="Dane pojazdu")

    # AI Output
    possible_causes = models.JSONField(help_text="Lista możliwych przyczyn z prawdopodobieństwem")
    severity_level = models.CharField(max_length=20, choices=[
        ('low', 'Niski - może poczekać'),
        ('medium', 'Średni - umów wizytę'),
        ('high', 'Wysoki - pilna naprawa'),
        ('critical', 'Krytyczny - natychmiast do warsztatu')
    ])

    # Rekomendacje
    recommended_actions = models.TextField()
    estimated_cost_min = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    estimated_cost_max = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    urgent_workshop_visit = models.BooleanField(default=False)

    # Metadata
    confidence_score = models.FloatField(help_text="0-1, pewność diagnozy")
    created_at = models.DateTimeField(auto_now_add=True)

class ChatFeedback(models.Model):
    """Ocena jakości odpowiedzi chatbota"""

    session = models.OneToOneField(ChatSession, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    helpful = models.BooleanField()
    feedback_text = models.TextField(null=True, blank=True)
    would_use_again = models.BooleanField()
    submitted_at = models.DateTimeField(auto_now_add=True)
```

#### AI Service:

```python
# ai_chat/services.py
import openai
from django.conf import settings
import json
import time

class AIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4"

    def analyze_symptoms(self, symptoms: str, vehicle_data: dict) -> dict:
        """Analizuj objawy i zwróć diagnozę"""

        prompt = self._build_diagnosis_prompt(symptoms, vehicle_data)

        start_time = time.time()
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )

            processing_time = int((time.time() - start_time) * 1000)

            return {
                'diagnosis': self._parse_ai_response(response.choices[0].message.content),
                'confidence': self._calculate_confidence(response),
                'processing_time_ms': processing_time,
                'model_used': self.model
            }

        except Exception as e:
            return {
                'error': str(e),
                'fallback_response': self._get_fallback_response()
            }

    def _get_system_prompt(self) -> str:
        return """
        Jesteś ekspertem mechanikiem samochodowym z 20-letnim doświadczeniem.
        Twoim zadaniem jest wstępna diagnoza problemów z pojazdami na podstawie opisanych objawów.

        ZASADY:
        1. Zawsze pytaj o dodatkowe szczegóły jeśli opis jest niejasny
        2. Podawaj możliwe przyczyny od najczęstszych do rzadkich
        3. Określ poziom pilności naprawy
        4. Sugeruj szacunkowe koszty gdy możliwe
        5. NIGDY nie diagnozuj definitywnie - zawsze podkreślaj potrzebę fizycznej inspekcji
        6. Odpowiadaj po polsku, używaj prostego języka

        FORMAT ODPOWIEDZI:
        {
            "possible_causes": [
                {"cause": "opis przyczyny", "probability": 0.7, "urgency": "medium"}
            ],
            "severity": "medium",
            "next_steps": "co klient powinien zrobić",
            "estimated_cost": {"min": 200, "max": 500},
            "urgent": false
        }
        """

    def _build_diagnosis_prompt(self, symptoms: str, vehicle_data: dict) -> str:
        return f"""
        DANE POJAZDU:
        - Marka: {vehicle_data.get('brand', 'Nieznana')}
        - Model: {vehicle_data.get('model', 'Nieznany')}
        - Rok: {vehicle_data.get('year', 'Nieznany')}
        - Przebieg: {vehicle_data.get('mileage', 'Nieznany')} km
        - Typ paliwa: {vehicle_data.get('fuel_type', 'Nieznany')}

        OPISANE OBJAWY:
        {symptoms}

        Proszę o wstępną diagnozę problemu.
        """
```

#### API Endpoints:

```python
# ai_chat/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_chat_session(request):
    """Rozpocznij nową sesję z chatbotem"""
    vehicle_id = request.data.get('vehicle_id')

    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, owner=request.user)
        session = ChatSession.objects.create(
            user=request.user,
            vehicle=vehicle
        )

        # Wiadomość powitalna
        welcome_msg = ChatMessage.objects.create(
            session=session,
            content=f"Witaj! Jestem Twoim asystentem diagnostycznym. Opowiedz mi o problemach z {vehicle.brand} {vehicle.model}.",
            is_ai_response=True
        )

        return Response({
            'session_id': session.session_id,
            'message': welcome_msg.content
        })

    except Vehicle.DoesNotExist:
        return Response({'error': 'Pojazd nie znaleziony'}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """Wyślij wiadomość do chatbota"""
    session_id = request.data.get('session_id')
    message = request.data.get('message')

    try:
        session = ChatSession.objects.get(session_id=session_id, user=request.user)

        # Zapisz wiadomość użytkownika
        user_msg = ChatMessage.objects.create(
            session=session,
            content=message,
            is_ai_response=False
        )

        # Przygotuj dane dla AI
        vehicle_data = {
            'brand': session.vehicle.brand,
            'model': session.vehicle.model,
            'year': session.vehicle.year,
            'mileage': session.vehicle.mileage,
            'fuel_type': session.vehicle.fuel_type
        }

        # Wywołaj AI
        ai_service = AIService()
        ai_response = ai_service.analyze_symptoms(message, vehicle_data)

        # Zapisz odpowiedź AI
        ai_msg = ChatMessage.objects.create(
            session=session,
            content=ai_response.get('response', 'Przepraszam, wystąpił błąd.'),
            is_ai_response=True,
            ai_confidence=ai_response.get('confidence'),
            ai_model_used=ai_response.get('model_used'),
            processing_time_ms=ai_response.get('processing_time_ms')
        )

        return Response({
            'message': ai_msg.content,
            'confidence': ai_msg.ai_confidence,
            'timestamp': ai_msg.timestamp
        })

    except ChatSession.DoesNotExist:
        return Response({'error': 'Sesja nie znaleziona'}, status=404)
```

### 1.2 Frontend Implementation

#### Chat Component:

```typescript
// components/AI/AIChatbot.tsx
import React, { useState, useEffect, useRef } from "react";
import {
	Box,
	TextField,
	Button,
	Paper,
	Typography,
	Avatar,
	Chip,
	LinearProgress,
} from "@mui/material";
import { SmartToy, Person, Send } from "@mui/icons-material";

interface Message {
	id: string;
	content: string;
	isAI: boolean;
	timestamp: string;
	confidence?: number;
}

interface AIChatbotProps {
	vehicleId: string;
	onDiagnosisComplete?: (diagnosis: any) => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({
	vehicleId,
	onDiagnosisComplete,
}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [sessionId, setSessionId] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		startChatSession();
	}, [vehicleId]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const startChatSession = async () => {
		try {
			const response = await fetch("/api/v1/ai-chat/start/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ vehicle_id: vehicleId }),
			});

			const data = await response.json();
			setSessionId(data.session_id);

			setMessages([
				{
					id: "1",
					content: data.message,
					isAI: true,
					timestamp: new Date().toISOString(),
				},
			]);
		} catch (error) {
			console.error("Error starting chat session:", error);
		}
	};

	const sendMessage = async () => {
		if (!inputMessage.trim() || !sessionId || isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			content: inputMessage,
			isAI: false,
			timestamp: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputMessage("");
		setIsLoading(true);

		try {
			const response = await fetch("/api/v1/ai-chat/message/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					session_id: sessionId,
					message: inputMessage,
				}),
			});

			const data = await response.json();

			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: data.message,
				isAI: true,
				timestamp: data.timestamp,
				confidence: data.confidence,
			};

			setMessages((prev) => [...prev, aiMessage]);
		} catch (error) {
			console.error("Error sending message:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<Paper
			elevation={3}
			sx={{ height: 600, display: "flex", flexDirection: "column" }}
		>
			{/* Header */}
			<Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
				<Typography
					variant="h6"
					sx={{ display: "flex", alignItems: "center", gap: 1 }}
				>
					<SmartToy />
					Asystent Diagnostyczny AI
				</Typography>
			</Box>

			{/* Messages */}
			<Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
				{messages.map((message) => (
					<Box
						key={message.id}
						sx={{
							display: "flex",
							mb: 2,
							justifyContent: message.isAI ? "flex-start" : "flex-end",
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "flex-start",
								gap: 1,
								maxWidth: "80%",
							}}
						>
							{message.isAI && (
								<Avatar sx={{ bgcolor: "primary.main" }}>
									<SmartToy />
								</Avatar>
							)}

							<Box>
								<Paper
									sx={{
										p: 2,
										bgcolor: message.isAI ? "grey.100" : "primary.main",
										color: message.isAI ? "text.primary" : "white",
									}}
								>
									<Typography variant="body1">{message.content}</Typography>
								</Paper>

								{message.isAI && message.confidence && (
									<Chip
										size="small"
										label={`Pewność: ${(message.confidence * 100).toFixed(0)}%`}
										sx={{ mt: 0.5 }}
									/>
								)}
							</Box>

							{!message.isAI && (
								<Avatar sx={{ bgcolor: "secondary.main" }}>
									<Person />
								</Avatar>
							)}
						</Box>
					</Box>
				))}

				{isLoading && (
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
						<Avatar sx={{ bgcolor: "primary.main" }}>
							<SmartToy />
						</Avatar>
						<Paper sx={{ p: 2, flex: 1 }}>
							<Typography variant="body2" color="text.secondary">
								AI analizuje Twój problem...
							</Typography>
							<LinearProgress sx={{ mt: 1 }} />
						</Paper>
					</Box>
				)}

				<div ref={messagesEndRef} />
			</Box>

			{/* Input */}
			<Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
				<Box sx={{ display: "flex", gap: 1 }}>
					<TextField
						fullWidth
						multiline
						maxRows={3}
						placeholder="Opisz problem z Twoim pojazdem..."
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						disabled={isLoading}
					/>
					<Button
						variant="contained"
						onClick={sendMessage}
						disabled={!inputMessage.trim() || isLoading}
						sx={{ minWidth: "auto", px: 2 }}
					>
						<Send />
					</Button>
				</Box>
			</Box>
		</Paper>
	);
};
```

### 1.3 Integration z Workshop Booking

```typescript
// components/AI/DiagnosisResults.tsx
export const DiagnosisResults: React.FC<{ diagnosis: AIDiagnosis }> = ({
	diagnosis,
}) => {
	const [nearbyWorkshops, setNearbyWorkshops] = useState([]);

	useEffect(() => {
		if (diagnosis.urgent_workshop_visit) {
			fetchNearbyWorkshops();
		}
	}, [diagnosis]);

	const bookAppointment = (workshopId: string) => {
		// Przekieruj do formularza rezerwacji z pre-filled diagnosis
		navigate(`/book-appointment/${workshopId}?diagnosis=${diagnosis.id}`);
	};

	return (
		<Paper sx={{ p: 3, mt: 2 }}>
			<Typography variant="h6" gutterBottom>
				Wyniki Diagnozy AI
			</Typography>

			{/* Severity indicator */}
			<Alert severity={getSeverityColor(diagnosis.severity_level)}>
				Poziom pilności: {diagnosis.severity_level}
			</Alert>

			{/* Possible causes */}
			<Box sx={{ mt: 2 }}>
				<Typography variant="subtitle1">Możliwe przyczyny:</Typography>
				{diagnosis.possible_causes.map((cause, index) => (
					<Chip
						key={index}
						label={`${cause.cause} (${(cause.probability * 100).toFixed(0)}%)`}
						sx={{ m: 0.5 }}
					/>
				))}
			</Box>

			{/* Cost estimate */}
			{diagnosis.estimated_cost_min && (
				<Typography variant="body2" sx={{ mt: 2 }}>
					Szacunkowy koszt: {diagnosis.estimated_cost_min} -{" "}
					{diagnosis.estimated_cost_max} PLN
				</Typography>
			)}

			{/* Urgent booking */}
			{diagnosis.urgent_workshop_visit && (
				<Box sx={{ mt: 3 }}>
					<Typography variant="subtitle1" color="error">
						Zalecana natychmiastowa wizyta w warsztacie!
					</Typography>
					<Button
						variant="contained"
						color="error"
						onClick={() => bookAppointment("nearest")}
						sx={{ mt: 1 }}
					>
						Znajdź najbliższy warsztat
					</Button>
				</Box>
			)}
		</Paper>
	);
};
```

---

## 💬 FAZA 2: REAL-TIME CHAT (Miesiąc 2)

### Cel biznesowy:

Bezpośrednia komunikacja między klientami a mechanikami w czasie rzeczywistym.

### 2.1 Backend Models

```python
# chat/models.py
class Conversation(models.Model):
    """Konwersacja między klientem a mechanikiem"""

    # Uczestnicy
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_conversations')
    mechanic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mechanic_conversations')

    # Kontekst
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, null=True, blank=True)
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)
    subject = models.CharField(max_length=200, help_text="Temat rozmowy")

    # Status
    status = models.CharField(max_length=20, choices=[
        ('active', 'Aktywna'),
        ('waiting_client', 'Oczekuje na klienta'),
        ('waiting_mechanic', 'Oczekuje na mechanika'),
        ('resolved', 'Rozwiązana'),
        ('closed', 'Zamknięta')
    ], default='active')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Niski'),
        ('normal', 'Normalny'),
        ('high', 'Wysoki'),
        ('urgent', 'Pilny')
    ], default='normal')

class Message(models.Model):
    """Wiadomość w konwersacji"""

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)

    # Treść
    content = models.TextField()
    message_type = models.CharField(max_length=20, choices=[
        ('text', 'Tekst'),
        ('image', 'Zdjęcie'),
        ('file', 'Plik'),
        ('system', 'Systemowa'),
        ('quote', 'Wycena')
    ], default='text')

    # Załączniki
    attachment = models.FileField(upload_to='chat_attachments/', null=True, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(null=True, blank=True)

    # Metadata dla wyceny
    quote_data = models.JSONField(null=True, blank=True, help_text="Dane wyceny jeśli message_type=quote")

class ConversationParticipant(models.Model):
    """Uczestnicy konwersacji z dodatkowymi metadanymi"""

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Status uczestnictwa
    joined_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    is_typing = models.BooleanField(default=False)

    # Preferencje
    notifications_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ['conversation', 'user']
```

### 2.2 WebSocket Consumers

```python
# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Sprawdź czy użytkownik ma dostęp do konwersacji
        has_access = await self.check_conversation_access()
        if not has_access:
            await self.close()
            return

        # Dołącz do grupy
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Oznacz użytkownika jako online
        await self.mark_user_online()

    async def disconnect(self, close_code):
        # Opuść grupę
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Oznacz użytkownika jako offline
        await self.mark_user_offline()

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'typing_start':
            await self.handle_typing_start()
        elif message_type == 'typing_stop':
            await self.handle_typing_stop()
        elif message_type == 'mark_read':
            await self.handle_mark_read(data)

    async def handle_chat_message(self, data):
        content = data['content']

        # Zapisz wiadomość do bazy
        message = await self.save_message(content)

        # Wyślij do wszystkich w grupie
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': message.id,
                    'content': message.content,
                    'sender_id': message.sender.id,
                    'sender_name': f"{message.sender.first_name} {message.sender.last_name}",
                    'timestamp': message.created_at.isoformat(),
                    'message_type': message.message_type
                }
            }
        )

        # Wyślij push notification jeśli odbiorca offline
        await self.send_push_notification_if_needed(message)

    async def chat_message(self, event):
        """Wyślij wiadomość do WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    @database_sync_to_async
    def check_conversation_access(self):
        """Sprawdź czy użytkownik ma dostęp do konwersacji"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            user = self.scope['user']
            return user in [conversation.client, conversation.mechanic]
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        """Zapisz wiadomość do bazy danych"""
        conversation = Conversation.objects.get(id=self.conversation_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=self.scope['user'],
            content=content
        )

        # Aktualizuj timestamp ostatniej wiadomości
        conversation.last_message_at = message.created_at
        conversation.save()

        return message
```

### 2.3 Frontend Chat Interface

```typescript
// components/Chat/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import {
	Box,
	Paper,
	TextField,
	IconButton,
	Typography,
	Avatar,
	Chip,
	Menu,
	MenuItem,
} from "@mui/material";
import { Send, AttachFile, EmojiEmotions, MoreVert } from "@mui/icons-material";

interface ChatWindowProps {
	conversationId: string;
	currentUser: User;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
	conversationId,
	currentUser,
}) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [otherUserTyping, setOtherUserTyping] = useState(false);
	const [socket, setSocket] = useState<WebSocket | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		connectWebSocket();
		loadMessageHistory();

		return () => {
			if (socket) {
				socket.close();
			}
		};
	}, [conversationId]);

	const connectWebSocket = () => {
		const token = localStorage.getItem("token");
		const wsUrl = `ws://localhost:8000/ws/chat/${conversationId}/?token=${token}`;

		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log("WebSocket connected");
			setSocket(ws);
		};

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data);
			handleWebSocketMessage(data);
		};

		ws.onclose = () => {
			console.log("WebSocket disconnected");
			// Reconnect logic
			setTimeout(connectWebSocket, 3000);
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
		};
	};

	const handleWebSocketMessage = (data: any) => {
		switch (data.type) {
			case "chat_message":
				setMessages((prev) => [...prev, data.message]);
				scrollToBottom();
				break;
			case "typing_start":
				if (data.user_id !== currentUser.id) {
					setOtherUserTyping(true);
				}
				break;
			case "typing_stop":
				if (data.user_id !== currentUser.id) {
					setOtherUserTyping(false);
				}
				break;
		}
	};

	const sendMessage = () => {
		if (!newMessage.trim() || !socket) return;

		socket.send(
			JSON.stringify({
				type: "chat_message",
				content: newMessage,
			})
		);

		setNewMessage("");
		stopTyping();
	};

	const handleTyping = (value: string) => {
		setNewMessage(value);

		if (!isTyping && socket) {
			setIsTyping(true);
			socket.send(JSON.stringify({ type: "typing_start" }));
		}

		// Reset typing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		typingTimeoutRef.current = setTimeout(() => {
			stopTyping();
		}, 1000);
	};

	const stopTyping = () => {
		if (isTyping && socket) {
			setIsTyping(false);
			socket.send(JSON.stringify({ type: "typing_stop" }));
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<Paper
			elevation={3}
			sx={{ height: "100%", display: "flex", flexDirection: "column" }}
		>
			{/* Chat Header */}
			<Box
				sx={{
					p: 2,
					borderBottom: 1,
					borderColor: "divider",
					bgcolor: "grey.50",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<Avatar />
						<Box>
							<Typography variant="subtitle1">Jan Kowalski</Typography>
							<Typography variant="caption" color="text.secondary">
								Mechanik • Online
							</Typography>
						</Box>
					</Box>

					<IconButton>
						<MoreVert />
					</IconButton>
				</Box>
			</Box>

			{/* Messages Area */}
			<Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
				{messages.map((message) => (
					<MessageBubble
						key={message.id}
						message={message}
						isOwn={message.sender_id === currentUser.id}
					/>
				))}

				{otherUserTyping && (
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
						<Avatar size="small" />
						<Chip size="small" label="pisze..." />
					</Box>
				)}

				<div ref={messagesEndRef} />
			</Box>

			{/* Message Input */}
			<Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
				<Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
					<IconButton size="small">
						<AttachFile />
					</IconButton>

					<TextField
						fullWidth
						multiline
						maxRows={4}
						placeholder="Napisz wiadomość..."
						value={newMessage}
						onChange={(e) => handleTyping(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								sendMessage();
							}
						}}
					/>

					<IconButton size="small">
						<EmojiEmotions />
					</IconButton>

					<IconButton
						color="primary"
						onClick={sendMessage}
						disabled={!newMessage.trim()}
					>
						<Send />
					</IconButton>
				</Box>
			</Box>
		</Paper>
	);
};

// Message Bubble Component
const MessageBubble: React.FC<{ message: Message; isOwn: boolean }> = ({
	message,
	isOwn,
}) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: isOwn ? "flex-end" : "flex-start",
				mb: 1,
			}}
		>
			<Paper
				sx={{
					p: 1.5,
					maxWidth: "70%",
					bgcolor: isOwn ? "primary.main" : "grey.100",
					color: isOwn ? "white" : "text.primary",
				}}
			>
				<Typography variant="body2">{message.content}</Typography>
				<Typography
					variant="caption"
					sx={{
						display: "block",
						mt: 0.5,
						opacity: 0.7,
						textAlign: "right",
					}}
				>
					{new Date(message.timestamp).toLocaleTimeString()}
				</Typography>
			</Paper>
		</Box>
	);
};
```

---

_[Kontynuacja dokumentu w następnych sekcjach...]_

## 🗺️ FAZA 3: GEOLOKALIZACJA I MAPA (Miesiąc 3)

[Szczegółowy opis implementacji map, wyszukiwania warsztatów po odległości]

## 📅 FAZA 4: KALENDARZ I HARMONOGRAMOWANIE (Miesiąc 4)

[Szczegółowy opis systemu kalendarza dla mechaników]

## 💳 FAZA 5: PŁATNOŚCI ONLINE (Miesiąc 5)

[Integracja ze Stripe/PayU/PayPal]

## 📊 FAZA 6: RAPORTY I ANALITYKA (Miesiąc 6)

[Business Intelligence dashboard]

---

**Status dokumentu:** Część 1/2 - AI Chatbot i Real-time Chat  
**Pozostałe fazy:** Do uzupełnienia w kolejnych plikach
