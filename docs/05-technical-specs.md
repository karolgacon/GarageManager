# 🔧 SPECYFIKACJA TECHNICZNA GARAGEMANAGER

**Wersja:** 2.0  
**Data:** 25 października 2025  
**Status:** Architecture Specification  
**Target:** Production-ready system

## 🏗️ ARCHITECTURE OVERVIEW

### System Architecture Pattern: **Microservices-Ready Monolith**

Rozpoczynamy jako monolith z dobrą separacją concerns, gotowy do podziału na microservices w przyszłości.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TS)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Web App   │ │ Mobile PWA  │ │    Admin Dashboard      ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY / NGINX                      │
│              Load Balancer + SSL Termination               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  DJANGO BACKEND API                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  REST API   │ │ WebSocket   │ │      AI Service         ││
│  │    (DRF)    │ │ (Channels)  │ │     (OpenAI)           ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA & CACHE LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ PostgreSQL  │ │   Redis     │ │     File Storage        ││
│  │ (Primary)   │ │ (Cache/WS)  │ │    (AWS S3/Local)       ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                BACKGROUND SERVICES                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Celery    │ │  RabbitMQ   │ │   Monitoring            ││
│  │ (Workers)   │ │ (Broker)    │ │ (Grafana/Prometheus)    ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 TECHNOLOGY STACK

### Backend Stack

```yaml
Core Framework:
  - Django 5.1.3
  - Django REST Framework 3.14.0
  - Django Channels 4.0+ (WebSocket)

Database:
  - PostgreSQL 15+ (Primary)
  - Redis 7+ (Cache, Sessions, WebSocket)

Background Processing:
  - Celery 5.4.0
  - RabbitMQ 3.12+ (Message Broker)

AI Integration:
  - OpenAI API (GPT-4)
  - Custom AI Service Layer

Payment Processing:
  - Stripe API
  - PayU/PayPal (backup)

Maps & Geolocation:
  - Google Maps API
  - PostGIS (PostgreSQL extension)

Email Service:
  - Brevo API (current)
  - SMTP fallback
```

### Frontend Stack

```yaml
Core Framework:
  - React 18.3.1
  - TypeScript 5.2.2
  - Vite 6.3.4 (Build tool)

UI Framework:
  - Material UI 5.17.1
  - Material Icons
  - Custom CSS modules

State Management:
  - React Context API
  - useState/useEffect hooks
  - Custom hooks for API calls

Real-time:
  - WebSocket (native)
  - Custom WebSocket hook

Routing:
  - React Router DOM 7.4.1

Charts & Analytics:
  - Recharts 2.15.3
  - Chart.js (backup)

Maps:
  - Google Maps React API
  - Leaflet (backup option)
```

### DevOps & Infrastructure

```yaml
Containerization:
  - Docker & Docker Compose
  - Multi-stage builds

Web Server:
  - Nginx (reverse proxy)
  - Gunicorn (WSGI)
  - Daphne (ASGI for WebSocket)

Monitoring:
  - Prometheus + Grafana
  - Sentry (error tracking)
  - Django Debug Toolbar (dev)

CI/CD:
  - GitHub Actions
  - Automated testing
  - Docker deployment

Security:
  - HTTPS/SSL certificates
  - JWT authentication
  - CORS configuration
  - Rate limiting
```

---

## 🗄️ DATABASE DESIGN

### Core Tables Structure

#### Users & Authentication

```sql
-- Enhanced User model
users_user (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE,
    email VARCHAR(254) UNIQUE,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role VARCHAR(20) CHECK (role IN ('admin', 'owner', 'mechanic', 'client')),
    status VARCHAR(20) DEFAULT 'active',
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0
);

-- User profiles with enhanced fields
users_profile (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users_user(id),
    address TEXT,
    phone VARCHAR(15),
    photo VARCHAR(255),
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    date_of_birth DATE,
    gender VARCHAR(10),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    marketing_consent BOOLEAN DEFAULT FALSE,
    privacy_policy_accepted BOOLEAN DEFAULT TRUE
);
```

#### Workshops & Locations

```sql
-- Enhanced Workshop with geolocation
workshops_workshop (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    owner_id INTEGER REFERENCES users_user(id),
    location TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    address_full TEXT,
    google_place_id VARCHAR(255),
    specialization VARCHAR(50),
    contact_email VARCHAR(254),
    contact_phone VARCHAR(20),
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Working hours for workshops
workshops_workinghours (
    id SERIAL PRIMARY KEY,
    workshop_id INTEGER REFERENCES workshops_workshop(id),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    opens_at TIME,
    closes_at TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    break_start TIME,
    break_end TIME,
    UNIQUE(workshop_id, day_of_week)
);
```

#### AI Chat System

```sql
-- AI Chatbot sessions
ai_chat_chatsession (
    id SERIAL PRIMARY KEY,
    session_id UUID UNIQUE DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users_user(id),
    vehicle_id INTEGER REFERENCES vehicles_vehicle(id),
    workshop_id INTEGER REFERENCES workshops_workshop(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
ai_chat_chatmessage (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES ai_chat_chatsession(id),
    content TEXT,
    is_ai_response BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT NOW(),
    ai_confidence DECIMAL(3,2),
    ai_model_used VARCHAR(50),
    processing_time_ms INTEGER,
    sentiment VARCHAR(20)
);

-- AI Diagnosis results
ai_chat_aidiagnosis (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES ai_chat_chatsession(id),
    symptoms_collected JSONB,
    vehicle_data JSONB,
    possible_causes JSONB,
    severity_level VARCHAR(20),
    recommended_actions TEXT,
    estimated_cost_min DECIMAL(10,2),
    estimated_cost_max DECIMAL(10,2),
    urgent_workshop_visit BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Real-time Chat

```sql
-- Human-to-human conversations
chat_conversation (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users_user(id),
    mechanic_id INTEGER REFERENCES users_user(id),
    appointment_id INTEGER REFERENCES appointments_appointment(id),
    workshop_id INTEGER REFERENCES workshops_workshop(id),
    subject VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active',
    priority VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP
);

-- Chat messages
chat_message (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chat_conversation(id),
    sender_id INTEGER REFERENCES users_user(id),
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text',
    attachment VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    edited_at TIMESTAMP,
    quote_data JSONB
);
```

#### Enhanced Inventory

```sql
-- Suppliers
inventory_supplier (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    contact_person VARCHAR(100),
    email VARCHAR(254),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Polska',
    website VARCHAR(200),
    tax_id VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0,
    delivery_time_days INTEGER DEFAULT 7,
    minimum_order_value DECIMAL(10,2) DEFAULT 0,
    payment_terms VARCHAR(100) DEFAULT '30 dni',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Parts
inventory_part (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    manufacturer VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock_level INTEGER DEFAULT 5,
    category VARCHAR(50),
    supplier_id INTEGER REFERENCES inventory_supplier(id),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    warranty_months INTEGER DEFAULT 12,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stock alerts
inventory_stockalert (
    id SERIAL PRIMARY KEY,
    part_id INTEGER REFERENCES inventory_part(id),
    workshop_id INTEGER REFERENCES workshops_workshop(id),
    alert_type VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE
);
```

#### Calendar & Scheduling

```sql
-- Mechanic schedules
calendar_mechanicschedule (
    id SERIAL PRIMARY KEY,
    mechanic_id INTEGER REFERENCES users_user(id),
    date DATE,
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    break_start TIME,
    break_end TIME,
    notes TEXT
);

-- Time slots for booking
calendar_timeslot (
    id SERIAL PRIMARY KEY,
    mechanic_id INTEGER REFERENCES users_user(id),
    date DATE,
    start_time TIME,
    end_time TIME,
    is_booked BOOLEAN DEFAULT FALSE,
    appointment_id INTEGER REFERENCES appointments_appointment(id),
    duration_minutes INTEGER DEFAULT 60
);
```

#### Payments & Billing

```sql
-- Payment gateways
payments_paymentgateway (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB
);

-- Online payments
payments_onlinepayment (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES billing_invoice(id),
    gateway_id INTEGER REFERENCES payments_paymentgateway(id),
    gateway_transaction_id VARCHAR(255),
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'PLN',
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    metadata JSONB
);
```

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_workshops_location ON workshops_workshop USING GIST (POINT(longitude, latitude));
CREATE INDEX idx_appointments_date ON appointments_appointment(date);
CREATE INDEX idx_notifications_user_unread ON notifications_notification(user_id, read_status) WHERE read_status = FALSE;
CREATE INDEX idx_chat_messages_conversation_time ON chat_message(conversation_id, created_at);
CREATE INDEX idx_inventory_parts_stock ON inventory_part(stock_quantity) WHERE stock_quantity <= minimum_stock_level;
```

---

## 🔌 API DESIGN

### RESTful API Structure

```
Base URL: https://api.garagemanager.com/v1/

Authentication:
  POST /auth/login/
  POST /auth/register/
  POST /auth/refresh/
  POST /auth/logout/

Users & Profiles:
  GET    /users/
  GET    /users/{id}/
  PUT    /users/{id}/
  GET    /users/profile/
  PUT    /users/profile/

Workshops:
  GET    /workshops/
  POST   /workshops/
  GET    /workshops/{id}/
  PUT    /workshops/{id}/
  GET    /workshops/nearby/?lat={lat}&lng={lng}&radius={km}
  GET    /workshops/{id}/availability/

Vehicles:
  GET    /vehicles/
  POST   /vehicles/
  GET    /vehicles/{id}/
  PUT    /vehicles/{id}/
  DELETE /vehicles/{id}/
  GET    /vehicles/{id}/history/

AI Chat:
  POST   /ai-chat/start/
  POST   /ai-chat/message/
  GET    /ai-chat/sessions/
  GET    /ai-chat/sessions/{session_id}/
  POST   /ai-chat/feedback/

Real-time Chat:
  GET    /chat/conversations/
  POST   /chat/conversations/
  GET    /chat/conversations/{id}/
  GET    /chat/conversations/{id}/messages/
  POST   /chat/conversations/{id}/messages/

Appointments:
  GET    /appointments/
  POST   /appointments/
  GET    /appointments/{id}/
  PUT    /appointments/{id}/
  DELETE /appointments/{id}/

Calendar:
  GET    /calendar/availability/?mechanic_id={id}&date={date}
  POST   /calendar/book-slot/
  GET    /calendar/schedule/{mechanic_id}/

Inventory:
  GET    /inventory/parts/
  POST   /inventory/parts/
  GET    /inventory/suppliers/
  POST   /inventory/suppliers/
  GET    /inventory/stock-alerts/

Payments:
  POST   /payments/create-intent/
  POST   /payments/confirm/
  GET    /payments/history/
  POST   /payments/webhooks/stripe/

Reports:
  GET    /reports/revenue/
  GET    /reports/customers/
  GET    /reports/workshops/
  POST   /reports/generate/
```

### WebSocket Endpoints

```
Chat WebSocket:
  ws://api.garagemanager.com/ws/chat/{conversation_id}/

Notifications WebSocket:
  ws://api.garagemanager.com/ws/notifications/{user_id}/

AI Chat WebSocket:
  ws://api.garagemanager.com/ws/ai-chat/{session_id}/
```

### API Response Format

```json
{
  "success": true,
  "data": {
    // Actual response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-10-25T10:30:00Z",
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8
  }
}

// Error format
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"],
      "password": ["Password too short"]
    }
  },
  "timestamp": "2025-10-25T10:30:00Z"
}
```

---

## 🔐 SECURITY SPECIFICATIONS

### Authentication & Authorization

```python
# JWT Configuration
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}

# Role-based permissions
class WorkshopOwnerPermission(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class MechanicPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['mechanic', 'owner', 'admin']
```

### Data Protection

```python
# Sensitive data encryption
from cryptography.fernet import Fernet

class EncryptedField(models.TextField):
    def __init__(self, *args, **kwargs):
        self.cipher = Fernet(settings.ENCRYPTION_KEY)
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return self.cipher.decrypt(value.encode()).decode()

    def to_python(self, value):
        return self.from_db_value(value, None, None)

    def get_prep_value(self, value):
        if value is None:
            return value
        return self.cipher.encrypt(value.encode()).decode()

# Usage for sensitive fields
class Payment(models.Model):
    card_last_four = models.CharField(max_length=4)
    encrypted_token = EncryptedField()  # For storing payment tokens
```

### Rate Limiting

```python
# API rate limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'ai_chat': '50/hour',  # Limit AI calls
        'payment': '10/hour'    # Limit payment attempts
    }
}
```

---

## 📱 FRONTEND ARCHITECTURE

### Component Structure

```
src/
├── components/
│   ├── Common/              # Reusable components
│   │   ├── Button/
│   │   ├── Modal/
│   │   ├── DataTable/
│   │   └── LoadingSpinner/
│   ├── Layout/              # Layout components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout/
│   ├── Auth/                # Authentication
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   └── ProtectedRoute/
│   ├── Workshop/            # Workshop related
│   │   ├── WorkshopCard/
│   │   ├── WorkshopMap/
│   │   └── WorkshopForm/
│   ├── Vehicle/             # Vehicle management
│   ├── Chat/                # Chat components
│   │   ├── ChatWindow/
│   │   ├── MessageBubble/
│   │   └── ConversationList/
│   ├── AI/                  # AI Chatbot
│   │   ├── AIChatbot/
│   │   ├── DiagnosisResults/
│   │   └── SymptomCollector/
│   ├── Calendar/            # Scheduling
│   ├── Payment/             # Payment processing
│   └── Reports/             # Analytics & Reports
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   ├── useAPI.ts
│   └── useLocalStorage.ts
├── services/                # API services
│   ├── api.ts
│   ├── authService.ts
│   ├── chatService.ts
│   └── paymentService.ts
├── utils/                   # Utility functions
├── types/                   # TypeScript definitions
└── constants/               # App constants
```

### State Management Strategy

```typescript
// Context-based state management
interface AppState {
	auth: AuthState;
	chat: ChatState;
	notifications: NotificationState;
	ui: UIState;
}

// Custom hooks for state management
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};

// API integration with React Query (future enhancement)
export const useWorkshops = (filters: WorkshopFilters) => {
	return useQuery({
		queryKey: ["workshops", filters],
		queryFn: () => apiClient.getWorkshops(filters),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Production Environment

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - backend
      - frontend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DJANGO_SETTINGS_MODULE=backend.settings.production
      - DATABASE_URL=postgresql://user:pass@db:5432/garagemanager
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - REACT_APP_API_URL=https://api.garagemanager.com

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=garagemanager
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  celery:
    build: ./backend
    command: celery -A backend worker -l info
    depends_on:
      - db
      - redis

  celery-beat:
    build: ./backend
    command: celery -A backend beat -l info
    depends_on:
      - db
      - redis
```

### Monitoring & Logging

```yaml
# monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  sentry:
    image: sentry:latest
    environment:
      - SENTRY_SECRET_KEY=your_secret_key
```

---

## 🔧 PERFORMANCE SPECIFICATIONS

### Backend Performance Targets

```python
# Performance requirements
API_RESPONSE_TIME_TARGET = 200  # milliseconds
WEBSOCKET_LATENCY_TARGET = 50   # milliseconds
DATABASE_QUERY_TIME_TARGET = 50  # milliseconds
FILE_UPLOAD_MAX_SIZE = 10 * 1024 * 1024  # 10MB

# Database optimization
class Meta:
    indexes = [
        models.Index(fields=['user', '-created_at']),
        models.Index(fields=['workshop', 'date']),
    ]

# Query optimization
def get_nearby_workshops(latitude, longitude, radius_km):
    """Optimized geolocation query"""
    return Workshop.objects.extra(
        select={
            'distance': """
                6371 * acos(
                    cos(radians(%s)) * cos(radians(latitude)) *
                    cos(radians(longitude) - radians(%s)) +
                    sin(radians(%s)) * sin(radians(latitude))
                )
            """
        },
        select_params=[latitude, longitude, latitude],
        where=["latitude IS NOT NULL AND longitude IS NOT NULL"],
        order_by=['distance']
    ).filter(distance__lt=radius_km)
```

### Frontend Performance

```typescript
// Performance optimizations
import { lazy, Suspense, memo, useMemo, useCallback } from "react";

// Lazy loading for routes
const WorkshopMap = lazy(() => import("./components/Workshop/WorkshopMap"));
const ChatWindow = lazy(() => import("./components/Chat/ChatWindow"));

// Memoized components
const MemoizedWorkshopCard = memo(WorkshopCard);

// Optimized list rendering
const VirtualizedList = ({ items, renderItem }) => {
	return (
		<FixedSizeList
			height={600}
			itemCount={items.length}
			itemSize={100}
			itemData={items}
		>
			{({ index, style, data }) => (
				<div style={style}>{renderItem(data[index])}</div>
			)}
		</FixedSizeList>
	);
};
```

---

## 🧪 TESTING STRATEGY

### Backend Testing

```python
# Unit tests
class WorkshopModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass'
        )

    def test_workshop_creation(self):
        workshop = Workshop.objects.create(
            name='Test Workshop',
            owner=self.user,
            latitude=50.0647,
            longitude=19.9450
        )
        self.assertEqual(workshop.name, 'Test Workshop')

# Integration tests
class AIChatAPITest(APITestCase):
    def test_chat_session_creation(self):
        response = self.client.post('/api/v1/ai-chat/start/', {
            'vehicle_id': self.vehicle.id
        })
        self.assertEqual(response.status_code, 201)

# Performance tests
class PerformanceTest(TestCase):
    def test_nearby_workshops_performance(self):
        start_time = time.time()
        workshops = get_nearby_workshops(50.0647, 19.9450, 50)
        end_time = time.time()

        self.assertLess(end_time - start_time, 0.1)  # < 100ms
```

### Frontend Testing

```typescript
// Component tests with React Testing Library
import { render, screen, fireEvent } from "@testing-library/react";
import { AIChatbot } from "./AIChatbot";

describe("AIChatbot", () => {
	test("sends message on button click", async () => {
		render(<AIChatbot vehicleId="123" />);

		const input = screen.getByPlaceholderText("Opisz problem...");
		const button = screen.getByRole("button", { name: /wyślij/i });

		fireEvent.change(input, { target: { value: "Problem z silnikiem" } });
		fireEvent.click(button);

		expect(await screen.findByText("Problem z silnikiem")).toBeInTheDocument();
	});
});

// E2E tests with Playwright
test("complete booking flow", async ({ page }) => {
	await page.goto("/workshops");
	await page.click('[data-testid="workshop-card"]');
	await page.click('[data-testid="book-appointment"]');
	await page.fill('[data-testid="date-picker"]', "2025-11-01");
	await page.click('[data-testid="confirm-booking"]');

	await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## 📊 MONITORING & ANALYTICS

### Application Monitoring

```python
# Custom metrics for Django
from prometheus_client import Counter, Histogram, Gauge

API_REQUESTS = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint'])
RESPONSE_TIME = Histogram('api_response_time_seconds', 'API response time')
ACTIVE_USERS = Gauge('active_users', 'Number of active users')
AI_CHAT_SESSIONS = Counter('ai_chat_sessions_total', 'Total AI chat sessions')

# Usage in views
@api_view(['GET'])
def workshops_list(request):
    API_REQUESTS.labels(method='GET', endpoint='/workshops/').inc()
    with RESPONSE_TIME.time():
        # View logic
        return Response(data)
```

### Business Analytics

```python
# Analytics models
class AnalyticsEvent(models.Model):
    event_type = models.CharField(max_length=50)
    user_id = models.IntegerField(null=True)
    properties = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)

# Track business events
def track_event(event_type, user_id=None, **properties):
    AnalyticsEvent.objects.create(
        event_type=event_type,
        user_id=user_id,
        properties=properties
    )

# Usage
track_event('appointment_booked', user_id=user.id,
           workshop_id=workshop.id, value=appointment.cost)
```

---

## 🔄 BACKUP & DISASTER RECOVERY

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Daily backup script

# Database backup
pg_dump -h localhost -U postgres garagemanager > backups/db_$(date +%Y%m%d).sql

# File storage backup
rsync -av media/ backups/media_$(date +%Y%m%d)/

# Upload to cloud storage
aws s3 sync backups/ s3://garagemanager-backups/

# Cleanup old backups (keep 30 days)
find backups/ -name "*.sql" -mtime +30 -delete
```

### Disaster Recovery Plan

1. **RTO (Recovery Time Objective):** 4 hours
2. **RPO (Recovery Point Objective):** 1 hour
3. **Backup frequency:** Daily full, hourly incremental
4. **Monitoring:** 24/7 automated monitoring
5. **Failover:** Automated failover to backup servers

---

**Dokument będzie aktualizowany w miarę rozwoju projektu.**  
**Ostatnia aktualizacja:** 25 października 2025
