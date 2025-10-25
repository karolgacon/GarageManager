# 🔧 PLAN POPRAWEK APLIKACJI GARAGEMANAGER

**Data:** 25 października 2025  
**Priorytet:** KRYTYCZNY  
**Szacowany czas:** 4-6 tygodni

## 🚨 KATEGORIE PROBLEMÓW

### 🔴 KRYTYCZNE (Muszą być naprawione natychmiast)

### 🟡 WAŻNE (Powinny być naprawione w pierwszej kolejności)

### 🟢 USPRAWNIENIA (Można odłożyć na później)

---

## 🔴 POPRAWKI KRYTYCZNE

### 1. NAPRAWIENIE POWIĄZAŃ POJAZD-WARSZTAT-MECHANIK

**Problem:** Vehicle ma pole `workshop` - pojazd przypisany na stałe do warsztatu  
**Wpływ:** Niemożliwy wybór różnych warsztatów, brak konkurencji  
**Priorytet:** 🔴 KRYTYCZNY - ARCHITEKTURA

#### Problem w kodzie:

```python
# vehicles/models.py - BŁĄD!
class Vehicle(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    workshop = models.ForeignKey(Workshop, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')  # ❌ ZŁE!
```

#### Poprawne rozwiązanie:

```python
# vehicles/models.py - POPRAWKA
class Vehicle(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    # workshop = USUWAMY TO POLE!

    @property
    def current_workshop(self):
        """Warsztat z ostatniej/aktualnej wizyty"""
        last_appointment = self.appointments.filter(
            status__in=['confirmed', 'in_progress']
        ).order_by('-date').first()
        return last_appointment.workshop if last_appointment else None

# appointments/models.py - ROZSZERZAMY
class Appointment(models.Model):
    # ... existing fields
    assigned_mechanic = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_appointments'
    )
```

#### Migracja:

```python
# vehicles/migrations/0002_remove_workshop_field.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('vehicles', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='vehicle',
            name='workshop',
        ),
    ]
```

### 2. GEOLOKALIZACJA WARSZTATÓW

**Problem:** Workshop model nie ma współrzędnych geograficznych  
**Wpływ:** Niemożliwe wyszukiwanie warsztatów po odległości  
**Priorytet:** 🔴 KRYTYCZNY

#### Zmiany w modelu:

```python
# workshops/models.py
class Workshop(models.Model):
    # ... existing fields

    # DODAĆ:
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Szerokość geograficzna"
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Długość geograficzna"
    )
    address_full = models.TextField(
        null=True,
        blank=True,
        help_text="Pełny adres strukturalny"
    )
    google_place_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Google Places API ID"
    )
```

### 3. NAPRAWIENIE MODELU DOSTAWCÓW

**Problem:** supplier w Part to CharField zamiast relacji  
**Wpływ:** Brak zarządzania dostawcami  
**Priorytet:** 🔴 KRYTYCZNY

#### Nowy model Supplier:

```python
# inventory/models.py
class Supplier(models.Model):
    """Dostawcy części samochodowych"""

    # Podstawowe dane
    name = models.CharField(max_length=100, unique=True)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    # Adres
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Polska")

    # Biznesowe
    website = models.URLField(null=True, blank=True)
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    # Logistyka
    delivery_time_days = models.IntegerField(default=7)
    minimum_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=100, default="30 dni")

    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
```

#### Zmiana w Part model:

```python
# inventory/models.py
class Part(models.Model):
    # ... existing fields

    # ZMIENIĆ Z:
    # supplier = models.CharField(max_length=100, null=True, blank=True)

    # NA:
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='parts'
    )
```

#### Migracja danych:

```python
# inventory/migrations/xxxx_migrate_suppliers.py
def migrate_suppliers(apps, schema_editor):
    """Migruj istniejących dostawców z CharField do Supplier model"""
    Part = apps.get_model('inventory', 'Part')
    Supplier = apps.get_model('inventory', 'Supplier')

    # Znajdź unikalne nazwy dostawców
    supplier_names = Part.objects.values_list('supplier', flat=True).distinct()

    # Stwórz Supplier objects
    for name in supplier_names:
        if name:
            Supplier.objects.get_or_create(
                name=name,
                defaults={
                    'email': f'contact@{name.lower().replace(" ", "")}.com',
                    'phone': '000-000-000',
                    'address': 'Adres do uzupełnienia'
                }
            )
```

### 4. WEBSOCKET INFRASTRUCTURE

**Problem:** Brak real-time komunikacji  
**Wpływ:** Niemożliwy chat, live notifications  
**Priorytet:** 🔴 KRYTYCZNY

#### Instalacja Channels:

```bash
pip install channels channels-redis
```

#### Konfiguracja:

```python
# backend/settings.py
INSTALLED_APPS = [
    # ...
    'channels',
]

ASGI_APPLICATION = 'backend.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

#### ASGI Configuration:

```python
# backend/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            # Chat routes będą dodane później
        ])
    ),
})
```

---

## 🟡 POPRAWKI WAŻNE

### 4. ROZSZERZENIE NOTIFICATION SYSTEM

**Problem:** Brak obsługi chat i AI notifications  
**Priorytet:** 🟡 WAŻNY

#### Rozszerzenie modelu:

```python
# notifications/models.py
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        # ... existing
        ('chat_message', 'Nowa wiadomość'),
        ('ai_diagnosis_ready', 'Diagnoza AI gotowa'),
        ('parts_low_stock', 'Niski stan magazynowy'),
        ('supplier_delivery', 'Dostawa od dostawcy'),
        ('payment_reminder', 'Przypomnienie o płatności'),
        ('service_feedback_request', 'Prośba o opinię'),
    ]

    # Dodać pola:
    read_at = models.DateTimeField(null=True, blank=True)
    action_url = models.URLField(null=True, blank=True)
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Niski'),
            ('medium', 'Średni'),
            ('high', 'Wysoki'),
            ('urgent', 'Pilny')
        ],
        default='medium'
    )
```

### 5. APPOINTMENT MODEL IMPROVEMENTS

**Problem:** Brak szczegółowego harmonogramowania  
**Priorytet:** 🟡 WAŻNY

#### Rozszerzenia:

```python
# appointments/models.py
class Appointment(models.Model):
    # ... existing fields

    # DODAĆ:
    duration_minutes = models.IntegerField(default=60)
    assigned_mechanic = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_appointments'
    )
    service_bay = models.CharField(max_length=50, null=True, blank=True)
    special_requirements = models.TextField(null=True, blank=True)
    customer_notes = models.TextField(null=True, blank=True)

    # Statusy dla trackingu
    STATUS_CHOICES = [
        ('requested', 'Wniosek'),
        ('confirmed', 'Potwierdzona'),
        ('in_progress', 'W trakcie'),
        ('waiting_parts', 'Oczekuje na części'),
        ('completed', 'Zakończona'),
        ('cancelled', 'Anulowana'),
        ('no_show', 'Klient nie przyszedł')
    ]
```

### 6. INVENTORY STOCK ALERTS

**Problem:** Brak automatycznych alertów o niskim stanie  
**Priorytet:** 🟡 WAŻNY

#### Nowy model:

```python
# inventory/models.py
class StockAlert(models.Model):
    """Alerty o niskim stanie magazynowym"""

    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    workshop = models.ForeignKey('workshops.Workshop', on_delete=models.CASCADE)
    alert_type = models.CharField(
        max_length=20,
        choices=[
            ('low_stock', 'Niski stan'),
            ('out_of_stock', 'Brak na stanie'),
            ('reorder_point', 'Punkt uzupełnienia')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
```

#### Celery Task:

```python
# inventory/tasks.py
@shared_task
def check_stock_levels():
    """Sprawdź stany magazynowe i wyślij alerty"""
    from inventory.models import PartInventory, StockAlert
    from notifications.models import Notification

    low_stock_parts = PartInventory.objects.filter(
        quantity__lte=F('part__minimum_stock_level')
    )

    for inventory in low_stock_parts:
        # Stwórz alert jeśli nie istnieje
        # Wyślij notification do managera warsztatu
```

---

## 🟢 USPRAWNIENIA

### 7. ENHANCED USER PROFILE

**Problem:** Brak pełnych danych kontaktowych  
**Priorytet:** 🟢 USPRAWNIENIE

```python
# users/models.py
class Profile(models.Model):
    # ... existing fields

    # DODAĆ:
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[('M', 'Mężczyzna'), ('F', 'Kobieta'), ('O', 'Inne')],
        null=True, blank=True
    )
    emergency_contact = models.CharField(max_length=100, null=True, blank=True)
    emergency_phone = models.CharField(max_length=20, null=True, blank=True)
    marketing_consent = models.BooleanField(default=False)
    privacy_policy_accepted = models.BooleanField(default=True)
```

### 8. WORKSHOP OPERATING HOURS

**Problem:** working_hours jako CharField  
**Priorytet:** 🟢 USPRAWNIENIE

```python
# workshops/models.py
class WorkingHours(models.Model):
    """Szczegółowe godziny pracy warsztatu"""

    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='operating_hours')
    day_of_week = models.IntegerField(choices=[
        (0, 'Poniedziałek'), (1, 'Wtorek'), (2, 'Środa'),
        (3, 'Czwartek'), (4, 'Piątek'), (5, 'Sobota'), (6, 'Niedziela')
    ])
    opens_at = models.TimeField()
    closes_at = models.TimeField()
    is_closed = models.BooleanField(default=False)
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)

    class Meta:
        unique_together = ['workshop', 'day_of_week']
```

---

## 📋 PLAN WYKONANIA POPRAWEK

### TYDZIEŃ 1: KRYTYCZNE BACKEND

- [ ] **Dzień 1**: Vehicle-Workshop relationship fix + migracja (PRIORYTET #1)
- [ ] **Dzień 2**: Assigned mechanic w Appointment + API updates
- [ ] **Dzień 3**: Geolokalizacja w Workshop model + migracja
- [ ] **Dzień 4**: Supplier model + migracja danych z Part
- [ ] **Dzień 5**: WebSocket infrastructure (Channels setup)

### TYDZIEŃ 2: MODELE I API

- [ ] **Dzień 1-2**: Rozszerzenie Notification system
- [ ] **Dzień 3-4**: Appointment model improvements
- [ ] **Dzień 5**: Stock alerts system

### TYDZIEŃ 3: FRONTEND INTEGRATION

- [ ] **Dzień 1-2**: Frontend dla supplier management
- [ ] **Dzień 3-4**: Map integration dla warsztatów
- [ ] **Dzień 5**: WebSocket client setup

### TYDZIEŃ 4: TESTING & POLISH

- [ ] **Dzień 1-3**: Testy jednostkowe dla nowych modeli
- [ ] **Dzień 4-5**: Integration tests + bug fixes

---

## 🧪 PLAN TESTOWANIA

### Backend Tests

```python
# tests/test_suppliers.py
class SupplierModelTest(TestCase):
    def test_supplier_creation(self):
        """Test tworzenia dostawcy"""

    def test_part_supplier_relationship(self):
        """Test relacji Part->Supplier"""

# tests/test_geolocation.py
class WorkshopLocationTest(TestCase):
    def test_nearby_workshops_api(self):
        """Test API wyszukiwania warsztatów po odległości"""
```

### Frontend Tests

```typescript
// tests/Suppliers.test.tsx
describe("Supplier Management", () => {
	test("should display suppliers list", () => {
		// Test listy dostawców
	});

	test("should create new supplier", () => {
		// Test tworzenia dostawcy
	});
});
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Database Migration

```bash
# Backup przed migracją
pg_dump garagemanager > backup_$(date +%Y%m%d).sql

# Wykonaj migracje
python manage.py makemigrations
python manage.py migrate

# Sprawdź integrity
python manage.py check
```

### Environment Variables

```bash
# .env - dodać nowe
GOOGLE_MAPS_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key  # dla przyszłego AI
```

### Docker Updates

```dockerfile
# Dockerfile - dodać Redis
RUN apt-get update && apt-get install -y redis-server
```

---

## 📊 EXPECTED OUTCOMES

Po wykonaniu tych poprawek:

### ✅ Funkcjonalności naprawione:

- Wyszukiwanie warsztatów po odległości
- Profesjonalne zarządzanie dostawcami
- Real-time infrastructure gotowa
- Automatyczne alerty magazynowe

### ✅ Przygotowanie pod przyszłe funkcje:

- WebSocket ready dla chat
- Geolocation ready dla mapy
- Notification system ready dla AI
- Enhanced models dla kalendarza

### ✅ Stabilność:

- Proper database relationships
- No more CharField hacks
- Scalable architecture
- Production-ready models

**Szacowany czas wykonania:** 4 tygodnie  
**Difficulty level:** Średni  
**Risk level:** Niski (głównie dodawanie, nie zmiany)
