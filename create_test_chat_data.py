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

def create_test_data():
    # Sprawdź użytkowników
    users = User.objects.all()
    print(f"Users: {users.count()}")

    # Sprawdź warsztaty
    workshops = Workshop.objects.all()
    print(f"Workshops: {workshops.count()}")

    # Sprawdź konwersacje
    conversations = Conversation.objects.all()
    print(f"Conversations: {conversations.count()}")

    if users.count() >= 2 and workshops.count() >= 1:
        client = users.filter(role='client').first() or users.first()
        mechanic = users.filter(role='mechanic').first() or users.last()
        workshop = workshops.first()
        
        print(f"Client: {client}")
        print(f"Mechanic: {mechanic}")
        print(f"Workshop: {workshop}")
        
        # Usuń stare konwersacje
        Conversation.objects.all().delete()
        
        # Stwórz konwersację
        conv = Conversation.objects.create(
            client=client,
            mechanic=mechanic,
            workshop=workshop,
            subject="Problem z hamulcami",
            status="active",
            priority="normal"
        )
        print(f"Created conversation: {conv}")
        
        # Stwórz kilka wiadomości
        msg1 = Message.objects.create(
            conversation=conv,
            sender=client,
            content="Witam, mam problem z hamulcami w moim aucie. Słyszę dziwne dźwięki."
        )
        print(f"Message 1: {msg1}")
        
        msg2 = Message.objects.create(
            conversation=conv,
            sender=mechanic,
            content="Dzień dobry! Proszę opisać dokładniej jaki to dźwięk i kiedy się pojawia?"
        )
        print(f"Message 2: {msg2}")
        
        msg3 = Message.objects.create(
            conversation=conv,
            sender=client,
            content="To taki zgrzyt podczas hamowania, szczególnie przy mocniejszym naciśnięciu pedału."
        )
        print(f"Message 3: {msg3}")
        
        msg4 = Message.objects.create(
            conversation=conv,
            sender=mechanic,
            content="Brzmi jak zużyte klocki hamulcowe. Proszę przyjechać na oględziny. Czy może jutro o 10:00?"
        )
        print(f"Message 4: {msg4}")
        
        # Druga konwersacja
        conv2 = Conversation.objects.create(
            client=client,
            mechanic=mechanic,
            workshop=workshop,
            subject="Przegląd okresowy",
            status="waiting_client",
            priority="low"
        )
        print(f"Created conversation 2: {conv2}")
        
        msg_conv2 = Message.objects.create(
            conversation=conv2,
            sender=mechanic,
            content="Przypominam o zbliżającym się terminie przeglądu Pana pojazdu."
        )
        print(f"Message conv2: {msg_conv2}")
        
        print("Test data created successfully!")
    else:
        print("Not enough users or workshops to create test data")
        print(f"Users count: {users.count()}, Workshops count: {workshops.count()}")

if __name__ == '__main__':
    create_test_data()