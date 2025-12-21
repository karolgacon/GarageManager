# 7. Projekt bazy danych

## 7.1 Wprowadzenie

Projekt bazy danych systemu GarageManager oparty jest na relacyjnej bazie danych PostgreSQL i wykorzystuje Django ORM do zarządzania strukturą oraz operacjami na danych. Architektura bazy została zaprojektowana z uwzględnieniem zasad normalizacji, zapewniając integralność danych, wydajność oraz skalowalność systemu.

System zarządza kompleksowym ekosystemem warsztatu samochodowego, obejmując:

- Zarządzanie użytkownikami i ich profilami
- Obsługę pojazdów i ich historii serwisowej
- Zarządzanie warsztatami i ich dostępnością
- System rezerwacji wizyt i napraw
- Magazyn części samochodowych i dostawców
- Fakturowanie i płatności
- System powiadomień i komunikacji
- Moduł czatu między klientami a mechanikami

Baza danych została zaprojektowana z myślą o wysokiej wydajności, bezpieczeństwie danych oraz łatwości rozszerzania funkcjonalności w przyszłości.

## 7.2 Struktura bazy danych

### 7.2.1 Moduł Użytkowników (Users)

**Tabela: users_user**
Główna tabela użytkowników dziedzicząca po `AbstractBaseUser` Django. Obsługuje różne role w systemie:

- `admin` - administrator systemu z pełnymi uprawnieniami
- `owner` - właściciel warsztatu z prawami zarządzania
- `mechanic` - mechanik wykonujący prace serwisowe
- `client` - klient korzystający z usług warsztatu

Kluczowe pola:

- System uwierzytelniania oparty na adresie e-mail
- Zarządzanie statusem konta (aktywny, zablokowany, zawieszony)
- Śledzenie prób logowania dla bezpieczeństwa
- Timestampy dla audytu aktywności

**Tabela: users_profile**
Rozszerzone informacje profilowe użytkowników zawierające:

- Dane kontaktowe (adres, telefon)
- Zdjęcie profilowe
- Preferowaną metodę komunikacji (email, telefon, SMS)

**Tabela: users_loginhistory**
Audyt logowań do systemu z informacjami o:

- Czasach logowania
- Informacjach o urządzeniu
- Statusie logowania (sukces/porażka)

**Tabela: users_loyaltypoints**
System punktów lojalnościowych z:

- Łączną liczbą punktów
- Poziomem członkostwa (bronze, silver, gold, platinum)
- Punktami zdobytymi w bieżącym roku

### 7.2.2 Moduł Warsztatów (Workshops)

**Tabela: workshops_workshop**
Centralna tabela warsztatów zawierająca:

- Podstawowe informacje (nazwa, lokalizacja, godziny pracy)
- Dane geolokalizacyjne (szerokość/długość geograficzna)
- Specjalizację warsztatu
- Dane kontaktowe i oceny

**Tabela: workshops_service**
Usługi oferowane przez warsztat:

- Opis i cena usługi
- Szacowany czas realizacji
- Kategoryzacja usług (konserwacja, naprawa, diagnostyka, tuning)

**Tabela: workshops_workshopmechanic**
Związek między warsztatami a mechanikami:

- Przypisanie mechanika do warsztatu
- Data zatrudnienia

**Tabela: workshops_mechanicavailability**
Harmonogram dostępności mechaników:

- Godziny pracy w poszczególne dni tygodnia
- Zarządzanie dostępnością czasową

**Tabela: workshops_mechanicbreak**
Zarządzanie przerwami w dostępności mechaników:

- Urlopy, święta, przerwy
- Opcjonalne godziny przerw
- Przerwy cykliczne

**Tabela: workshops_workshopavailability**
Harmonogram pracy warsztatu:

- Godziny otwarcia/zamknięcia
- Długość slotów czasowych
- Dostępność w poszczególne dni

**Tabela: workshops_workshopbreak**
Przerwy w dostępności warsztatów:

- Planowane przerwy w pracy
- Święta i okresy niepracujące

**Tabela: workshops_report**
System raportowania:

- Raporty dzienne, tygodniowe, miesięczne, roczne
- Dane w formacie JSON dla elastyczności

### 7.2.3 Moduł Pojazdów (Vehicles)

**Tabela: vehicles_vehicle**
Rejestr pojazdów klientów:

- Dane techniczne (marka, model, rok, VIN)
- Informacje o napędzie (typ paliwa, skrzynia biegów)
- Status pojazdu i historia serwisowa
- Powiązanie z właścicielem

**Tabela: vehicles_diagnostics**
Historia diagnostyki pojazdów:

- Wyniki diagnostyki z oceną powagi
- Szacowane koszty napraw
- Planowane przeglądy
- Ustawienia powiadomień

**Tabela: vehicles_maintenanceschedule**
Harmonogram konserwacji:

- Typy serwisu z interwałami czasowymi/kilometrowymi
- Rekomendowane daty wykonania
- Historia ostatnich wykonanych prac

**Tabela: vehicles_vehicleservice**
Historia serwisu pojazdów:

- Szczegóły wykonanych usług
- Koszty i terminy realizacji
- Notatki mechanika
- Status realizacji

### 7.2.4 Moduł Wizyt (Appointments)

**Tabela: appointments_appointment**
Centralna tabela zarządzania wizytami:

- Powiązanie klient-warsztat-pojazd
- Terminy i statusy wizyt
- Priorytet i typ wizyty
- Przypisany mechanik
- Szacowany czas realizacji

**Tabela: appointments_repairjob**
Szczegóły prac naprawczych:

- Opis prac i koszty
- Czas realizacji i poziom złożoności
- Okres gwarancji
- Notatki diagnostyczne

**Tabela: appointments_customerfeedback**
System opinii klientów:

- Oceny jakości usługi i punktualności
- Komentarze tekstowe
- Rekomendacje
- Odpowiedzi warsztatów

### 7.2.5 Moduł Magazynu (Inventory)

**Tabela: inventory_supplier**
Rejestr dostawców części:

- Dane kontaktowe i biznesowe
- Warunki współpracy (terminy dostaw, minimum zamówienia)
- Oceny dostawców

**Tabela: inventory_part**
Katalog części samochodowych:

- Podstawowe informacje (nazwa, producent, cena)
- Zarządzanie stanami magazynowymi
- Kategoryzacja części

**Tabela: inventory_stockentry**
Historia ruchów magazynowych:

- Rodzaje operacji (zakup, sprzedaż, zwrot, korekta)
- Śledzenie zmian w stanach
- Audyt operacji magazynowych

**Tabela: inventory_repairjobpart**
Części użyte w naprawach:

- Powiązanie z konkretnymi pracami
- Ilości i stan części
- Ceny zastosowane

**Tabela: inventory_partinventory**
Stany magazynowe w warsztatach:

- Lokalizacja części w magazynie
- Aktualne ilości

**Tabela: inventory_stockalert**
System alertów magazynowych:

- Powiadomienia o niskim stanie
- Punkty uzupełnienia zapasów
- Status rozwiązania alertów

### 7.2.6 Moduł Fakturowania (Billing)

**Tabela: billing_invoice**
System fakturowania:

- Kwoty, rabaty, podatki
- Terminy płatności
- Statusy faktur

**Tabela: billing_payment**
Rejestr płatności:

- Metody płatności
- Identyfikatory transakcji
- Powiązanie z fakturami

### 7.2.7 Moduł Powiadomień (Notifications)

**Tabela: notifications_notification**
Centralny system powiadomień:

- Różne kanały komunikacji (email, SMS, push)
- Typy powiadomień (przypomnienia, statusy, promocje)
- Priorytety i statusy przeczytania
- Powiązania z obiektami systemowymi

**Tabela: notifications_auditlog**
Dziennik audytu systemu:

- Śledzenie wszystkich operacji CRUD
- Historia zmian w danych
- Identyfikacja użytkowników

### 7.2.8 Moduł Czatu (Chat)

**Tabela: chat_conversation**
Konwersacje między użytkownikami:

- Uczestnicy rozmowy (klient-mechanik)
- Kontekst (wizyta, warsztat)
- Status i priorytety rozmów
- UUID dla WebSocket

**Tabela: chat_message**
Wiadomości w konwersacjach:

- Treść i typy wiadomości
- Załączniki i pliki
- Statusy przeczytania
- Dane wycen w formacie JSON

**Tabela: chat_conversationparticipant**
Zarządzanie uczestnikami:

- Metadane uczestnictwa
- Preferencje powiadomień
- Status aktywności (typing, last seen)

## 7.3 Schemat bazy danych

```dbml
// Użytkownicy i autoryzacja
Table users_user {
  id integer [primary key, increment]
  username varchar(150) [unique, not null]
  email varchar(100) [unique, not null]
  password varchar(128) [not null]
  first_name varchar(30)
  last_name varchar(30)
  role varchar(20) [not null, default: 'client'] // admin, owner, mechanic, client
  status varchar(20) [not null, default: 'active'] // active, blocked, suspended
  is_staff boolean [not null, default: false]
  is_active boolean [not null, default: true]
  date_joined timestamp [not null]
  last_login timestamp
  login_attempts integer [not null, default: 0]

  indexes {
    email [unique]
    username [unique]
    (role, status)
  }
}

Table users_profile {
  id integer [primary key, increment]
  user_id integer [ref: > users_user.id, not null, unique]
  address varchar(255)
  phone varchar(15)
  photo varchar(100)
  preferred_contact_method varchar(20) [default: 'email'] // email, phone, sms
}

Table users_loginhistory {
  id integer [primary key, increment]
  user_id integer [ref: > users_user.id, not null]
  login_time timestamp [not null]
  device_info varchar(255)
  status varchar(20) [not null] // success, failed
}

Table users_loyaltypoints {
  id integer [primary key, increment]
  user_id integer [ref: > users_user.id, not null, unique]
  total_points integer [not null, default: 0]
  membership_level varchar(20) [not null, default: 'bronze'] // bronze, silver, gold, platinum
  points_earned_this_year integer [not null, default: 0]
}

// Warsztat i usługi
Table workshops_workshop {
  id integer [primary key, increment]
  name varchar(255) [unique, not null]
  owner_id integer [ref: > users_user.id]
  working_hours varchar(100) [default: '8:00-16:00']
  location text [not null]
  latitude decimal(9,6)
  longitude decimal(9,6)
  address_full text
  google_place_id varchar(255)
  specialization varchar(50) [default: 'general'] // general, electric, diesel, bodywork, luxury
  contact_email varchar(254)
  contact_phone varchar(20)
  rating decimal(3,2) [default: 0]

  indexes {
    name [unique]
    (latitude, longitude)
    specialization
  }
}

Table workshops_service {
  id integer [primary key, increment]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  name varchar(255) [not null]
  description text [not null]
  price decimal(10,2) [not null]
  estimated_duration integer [not null, default: 60] // minutes
  category varchar(50) [default: 'maintenance'] // maintenance, repair, diagnostics, tuning

  indexes {
    workshop_id
    category
  }
}

Table workshops_workshopmechanic {
  id integer [primary key, increment]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  mechanic_id integer [ref: > users_user.id, not null]
  hired_date date [not null]

  indexes {
    (workshop_id, mechanic_id) [unique]
  }
}

Table workshops_mechanicavailability {
  id integer [primary key, increment]
  workshop_mechanic_id integer [ref: > workshops_workshopmechanic.id, not null]
  weekday integer [not null] // 0-6
  start_time time [not null]
  end_time time [not null]
  is_available boolean [not null, default: true]

  indexes {
    (workshop_mechanic_id, weekday) [unique]
  }
}

Table workshops_mechanicbreak {
  id integer [primary key, increment]
  workshop_mechanic_id integer [ref: > workshops_workshopmechanic.id, not null]
  start_date date [not null]
  end_date date [not null]
  start_time time
  end_time time
  reason varchar(255)
  is_recurring boolean [not null, default: false]
}

Table workshops_workshopavailability {
  id integer [primary key, increment]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  weekday integer [not null] // 0-6
  start_time time [not null]
  end_time time [not null]
  is_available boolean [not null, default: true]
  slot_duration integer [not null, default: 60] // minutes

  indexes {
    (workshop_id, weekday) [unique]
  }
}

Table workshops_workshopbreak {
  id integer [primary key, increment]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  start_date date [not null]
  end_date date [not null]
  start_time time
  end_time time
  reason varchar(255)
  is_recurring boolean [not null, default: false]
}

Table workshops_report {
  id integer [primary key, increment]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  type varchar(50) [not null] // daily, weekly, monthly, annual
  generated_at timestamp [not null]
  data jsonb
}

// Pojazdy
Table vehicles_vehicle {
  id integer [primary key, increment]
  brand varchar(50) [not null] // toyota, ford, volkswagen, bmw, mercedes
  model varchar(50) [not null]
  year integer [not null]
  registration_number varchar(20) [unique, not null]
  vin varchar(50) [unique, not null]
  color varchar(50)
  engine_type varchar(50)
  mileage integer
  fuel_type varchar(20) // petrol, diesel, electric, hybrid, lpg, cng
  transmission varchar(20) // manual, automatic, semi-automatic
  owner_id integer [ref: > users_user.id, not null]
  status varchar(20) [not null, default: 'active'] // active, inactive, maintenance
  last_service_date date
  next_service_due date
  image_url varchar(255)

  indexes {
    registration_number [unique]
    vin [unique]
    owner_id
    (brand, model)
  }
}

Table vehicles_diagnostics {
  id integer [primary key, increment]
  vehicle_id integer [ref: > vehicles_vehicle.id, not null]
  diagnostic_date timestamp [not null]
  diagnostic_notes text [not null]
  estimated_repair_cost decimal(10,2) [not null]
  severity_level varchar(20) [not null, default: 'low'] // low, medium, high, critical
  diagnostic_result jsonb
  next_inspection_date date
  email_notification boolean [not null, default: false]
  sms_notification boolean [not null, default: false]

  indexes {
    vehicle_id
    diagnostic_date
    severity_level
  }
}

Table vehicles_maintenanceschedule {
  id integer [primary key, increment]
  vehicle_id integer [ref: > vehicles_vehicle.id, not null]
  service_type varchar(50) [not null] // oil_change, brake_check, full_service, tire_rotation
  recommended_date date [not null]
  last_performed_date date
  next_due_date date [not null]
  mileage_interval integer [not null]

  indexes {
    vehicle_id
    next_due_date
  }
}

Table vehicles_vehicleservice {
  id integer [primary key, increment]
  vehicle_id integer [ref: > vehicles_vehicle.id, not null]
  service_id integer [ref: > workshops_service.id, not null]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  service_date date [not null]
  completion_date date
  status varchar(20) [not null, default: 'scheduled'] // scheduled, in_progress, completed, canceled
  cost decimal(10,2) [not null]
  description text
  mechanic_notes text

  indexes {
    vehicle_id
    workshop_id
    service_date
    status
  }
}

// Wizyty i naprawy
Table appointments_appointment {
  id integer [primary key, increment]
  client_id integer [ref: > users_user.id, not null]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  vehicle_id integer [ref: > vehicles_vehicle.id, not null]
  assigned_mechanic_id integer [ref: > users_user.id]
  date timestamp [not null]
  status varchar(20) [not null, default: 'scheduled'] // scheduled, in_progress, completed
  priority varchar(20) [not null, default: 'low'] // low, medium, high, urgent
  estimated_completion_date timestamp
  booking_type varchar(20) [not null, default: 'standard'] // standard, urgent
  appointment_type varchar(20) [not null, default: 'service'] // service, inspection, diagnostic, repair, maintenance, other
  service_description text
  duration_estimate integer // minutes

  indexes {
    client_id
    workshop_id
    vehicle_id
    assigned_mechanic_id
    date
    status
  }
}

Table appointments_repairjob {
  id integer [primary key, increment]
  appointment_id integer [ref: > appointments_appointment.id, not null]
  mechanic_id integer [ref: > users_user.id, not null]
  description text [not null]
  cost decimal(10,2) [not null]
  duration integer [not null] // minutes
  complexity_level varchar(20) [not null, default: 'simple'] // simple, moderate, complex
  warranty_period integer [not null, default: 3] // months
  diagnostic_notes text

  indexes {
    appointment_id
    mechanic_id
  }
}

Table appointments_customerfeedback {
  id integer [primary key, increment]
  repair_job_id integer [ref: > appointments_repairjob.id, not null, unique]
  client_id integer [ref: > users_user.id, not null]
  rating integer [not null] // 1-5
  review_text text
  feedback_date timestamp [not null]
  service_quality integer [not null] // 1-5
  punctuality_rating integer [not null] // 1-5
  would_recommend boolean [not null, default: false]
  response_from_workshop text
  response_date timestamp
  tags varchar(255)

  indexes {
    repair_job_id [unique]
    client_id
    rating
  }
}

// Magazyn i części
Table inventory_supplier {
  id integer [primary key, increment]
  name varchar(100) [unique, not null]
  contact_person varchar(100)
  email varchar(254) [not null]
  phone varchar(20) [not null]
  address text [not null]
  city varchar(100) [not null]
  postal_code varchar(20) [not null]
  country varchar(100) [not null, default: 'Polska']
  website varchar(200)
  tax_id varchar(50)
  rating decimal(3,2) [not null, default: 0]
  delivery_time_days integer [not null, default: 7]
  minimum_order_value decimal(10,2) [not null, default: 0]
  payment_terms varchar(100) [not null, default: '30 dni']
  is_active boolean [not null, default: true]
  created_at timestamp [not null]

  indexes {
    name [unique]
    is_active
  }
}

Table inventory_part {
  id integer [primary key, increment]
  name varchar(100) [not null]
  manufacturer varchar(100) [not null]
  price decimal(10,2) [not null]
  stock_quantity integer [not null, default: 0]
  minimum_stock_level integer [not null, default: 5]
  category varchar(50) [not null] // engine, electrical, brake, suspension, body
  supplier_id integer [ref: > inventory_supplier.id]

  indexes {
    category
    supplier_id
    (name, manufacturer)
  }
}

Table inventory_stockentry {
  id integer [primary key, increment]
  part_id integer [ref: > inventory_part.id, not null]
  change_type varchar(20) [not null] // purchase, sale, return, adjustment
  quantity_change integer [not null]
  timestamp timestamp [not null]
  user_id integer [ref: > users_user.id]
  notes text

  indexes {
    part_id
    timestamp
    change_type
  }
}

Table inventory_repairjobpart {
  id integer [primary key, increment]
  repair_job_id integer [ref: > appointments_repairjob.id, not null]
  part_id integer [ref: > inventory_part.id, not null]
  quantity integer [not null, default: 1]
  condition varchar(20) [not null, default: 'new'] // new, used, refurbished
  used_price decimal(10,2) [not null]

  indexes {
    repair_job_id
    part_id
  }
}

Table inventory_partinventory {
  id integer [primary key, increment]
  part_id integer [ref: > inventory_part.id, not null]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  quantity integer [not null, default: 0]
  location varchar(100)

  indexes {
    (part_id, workshop_id) [unique]
  }
}

Table inventory_stockalert {
  id integer [primary key, increment]
  part_id integer [ref: > inventory_part.id, not null]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  alert_type varchar(20) [not null] // low_stock, out_of_stock, reorder_point
  created_at timestamp [not null]
  resolved_at timestamp
  is_resolved boolean [not null, default: false]

  indexes {
    (part_id, workshop_id, alert_type) [unique]
  }
}

// Fakturowanie
Table billing_invoice {
  id integer [primary key, increment]
  client_id integer [ref: > users_user.id, not null]
  amount decimal(10,2) [not null]
  discount decimal(5,2) [not null, default: 0]
  issue_date date [not null]
  due_date date [not null]
  status varchar(20) [not null, default: 'pending'] // pending, paid, overdue, cancelled
  tax_rate decimal(5,2) [not null, default: 0.23]
  description text

  indexes {
    client_id
    status
    due_date
  }
}

Table billing_payment {
  id integer [primary key, increment]
  invoice_id integer [ref: > billing_invoice.id, not null]
  amount_paid decimal(10,2) [not null]
  payment_method varchar(50) [not null] // cash, card, transfer, online
  payment_date timestamp [not null]
  transaction_id varchar(100) [unique, not null]
  notes text

  indexes {
    invoice_id
    transaction_id [unique]
    payment_date
  }
}

// Powiadomienia
Table notifications_notification {
  id integer [primary key, increment]
  user_id integer [ref: > users_user.id, not null]
  message text [not null]
  read_status boolean [not null, default: false]
  read_at timestamp
  created_at timestamp [not null]
  notification_type varchar(50) [not null] // appointment_reminder, repair_status, invoice, promotional, system, etc.
  channel varchar(20) [not null, default: 'email'] // email, sms, push, queue
  priority varchar(20) [not null, default: 'medium'] // low, medium, high, urgent
  action_url varchar(200)
  related_object_id integer
  related_object_type varchar(50)
  processed boolean [not null, default: false]
  queue_message_id varchar(100)

  indexes {
    user_id
    created_at
    notification_type
    read_status
    priority
  }
}

Table notifications_auditlog {
  id integer [primary key, increment]
  user_id integer [ref: > users_user.id]
  action_type varchar(50) [not null] // create, update, delete
  table_name varchar(50) [not null]
  record_id integer [not null]
  old_value jsonb
  new_value jsonb
  timestamp timestamp [not null]

  indexes {
    user_id
    timestamp
    table_name
    action_type
  }
}

// Chat
Table chat_conversation {
  id integer [primary key, increment]
  client_id integer [ref: > users_user.id, not null]
  mechanic_id integer [ref: > users_user.id, not null]
  appointment_id integer [ref: > appointments_appointment.id]
  workshop_id integer [ref: > workshops_workshop.id, not null]
  subject varchar(200) [not null]
  status varchar(20) [not null, default: 'active'] // active, waiting_client, waiting_mechanic, resolved, closed
  created_at timestamp [not null]
  last_message_at timestamp [not null]
  closed_at timestamp
  priority varchar(20) [not null, default: 'normal'] // low, normal, high, urgent
  uuid uuid [unique, not null]

  indexes {
    client_id
    mechanic_id
    workshop_id
    status
    last_message_at
    uuid [unique]
  }
}

Table chat_message {
  id integer [primary key, increment]
  conversation_id integer [ref: > chat_conversation.id, not null]
  sender_id integer [ref: > users_user.id, not null]
  content text [not null]
  message_type varchar(20) [not null, default: 'text'] // text, image, file, system, quote
  attachment varchar(100)
  is_read boolean [not null, default: false]
  read_at timestamp
  created_at timestamp [not null]
  edited_at timestamp
  quote_data jsonb

  indexes {
    conversation_id
    sender_id
    created_at
    is_read
  }
}

Table chat_conversationparticipant {
  id integer [primary key, increment]
  conversation_id integer [ref: > chat_conversation.id, not null]
  user_id integer [ref: > users_user.id, not null]
  joined_at timestamp [not null]
  last_seen_at timestamp [not null]
  is_typing boolean [not null, default: false]
  notifications_enabled boolean [not null, default: true]

  indexes {
    (conversation_id, user_id) [unique]
  }
}
```

Powyższy schemat bazy danych obejmuje wszystkie kluczowe tabele systemu GarageManager z ich relacjami, indeksami i ograniczeniami. Schema zapewnia integralność danych, wydajność zapytań oraz skalowalność systemu zarządzania warsztatem samochodowym.
