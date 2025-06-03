# GarageManager

![GarageManager Logo](frontend/public/logo.png)

## 🚗 O Projekcie

GarageManager to kompleksowy system do zarządzania warsztatem samochodowym. Pozwala na obsługę klientów, pojazdów, rezerwacji, napraw, faktur oraz automatycznych powiadomień. System jest przeznaczony zarówno dla właścicieli, pracowników, jak i klientów warsztatu.

## ✨ Kluczowe Funkcje

- Zarządzanie rezerwacjami i kalendarzem
- Obsługa pojazdów i historia napraw
- Baza klientów i komunikacja
- Inwentaryzacja części
- Fakturowanie i raportowanie
- Automatyczne powiadomienia (e-mail, push)
- Panel administracyjny i role użytkowników

## 🛠️ Technologie

**Backend:**

- Python 3.x (Django, Django REST Framework)
- PostgreSQL
- Celery, RabbitMQ (kolejki powiadomień)

**Frontend:**

- React + TypeScript
- Material UI
- Vite

## 📋 Wymagania

- Node.js 16+
- Python 3.8+
- PostgreSQL 13+
- RabbitMQ 3.x

## 🚀 Instalacja

### Backend

```powershell
# Klonowanie repozytorium
git clone https://github.com/username/GarageManager.git
cd GarageManager/backend

# Wirtualne środowisko
python -m venv venv
.\venv\Scripts\activate

# Instalacja zależności
pip install -r requirements.txt

# Migracje bazy danych
python manage.py migrate

# Uruchomienie serwera
python manage.py runserver

# Worker powiadomień (osobny terminal)
python notifications/notification_worker.py
```

### Frontend

```powershell
cd ../frontend
npm install
npm run dev
```

## 👥 Role Użytkowników

- **Administrator** – pełna kontrola
- **Właściciel** – zarządzanie warsztatem
- **Mechanik** – obsługa napraw
- **Klient** – rezerwacje i historia pojazdu

## 📱 Zrzuty Ekranu

_Wstaw tu zrzuty ekranu aplikacji frontendowej_

## 🔄 Architektura

- **Frontend** – React/TypeScript
- **Backend API** – Django REST
- **Powiadomienia** – Celery + RabbitMQ

## 🤝 Wkład

Chcesz pomóc? Otwórz Pull Request lub zgłoś Issue!

## 📄 Licencja

MIT License

---

© 2025 GarageManager. Wszelkie prawa zastrzeżone.
