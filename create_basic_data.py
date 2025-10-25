#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.append('/backend')
django.setup()

from users.models import User
from workshops.models import Workshop
from chat.models import Conversation, Message
from django.utils import timezone

def create_basic_data():
    # Sprawdź co mamy
    users = User.objects.all()
    print("\n=== USERS ===")
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {getattr(user, 'role', 'N/A')}")
    
    workshops = Workshop.objects.all()
    print("\n=== WORKSHOPS ===")
    for workshop in workshops:
        print(f"ID: {workshop.id}, Name: {workshop.name}")
    
    # Stwórz warsztat jeśli nie ma
    if workshops.count() == 0:
        workshop = Workshop.objects.create(
            name="Auto-Service SP. z o.o.",
            location="Warszawa, ul. Warsztatowa 15",
            contact_phone="+48 22 123 45 67",
            contact_email="kontakt@auto-service.pl",
            specialization="general"
        )
        print(f"Created workshop: {workshop}")
    else:
        workshop = workshops.first()
    
    # Stwórz drugiego użytkownika (mechanika) jeśli nie ma
    if users.count() < 2:
        mechanic = User.objects.create_user(
            username="mechanic1",
            email="mechanic@auto-service.pl",
            password="mechanic123",
            first_name="Jan",
            last_name="Kowalski",
            role="mechanic"
        )
        print(f"Created mechanic: {mechanic}")
    
    # Pokaż zaktualizowane dane
    users = User.objects.all()
    print("\n=== UPDATED USERS ===")
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {getattr(user, 'role', 'N/A')}")
    
    workshops = Workshop.objects.all()
    print("\n=== UPDATED WORKSHOPS ===")
    for workshop in workshops:
        print(f"ID: {workshop.id}, Name: {workshop.name}")

if __name__ == '__main__':
    create_basic_data()