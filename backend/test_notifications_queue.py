import os
import django
import sys

# Konfiguracja środowiska Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notifications.services.queue_service import rabbit_client
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
import logging

User = get_user_model()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_direct_rabbit():
    """Test bezpośredniego wysyłania wiadomości przez RabbitMQ (Lab11)"""
    print("\n=== TEST 1: Bezpośrednie wysyłanie wiadomości przez RabbitMQ ===")
    
    # Przykładowa wiadomość z kropkami dla symulacji opóźnienia
    messages = [
        "Pierwsze zadanie...",
        "Drugie zadanie z większym opóźnieniem........",
        "Trzecie zadanie.",
    ]
    
    for msg in messages:
        rabbit_client.send_message("task_queue", msg)
        print(f"Wysłano: {msg}")
    
    print("Wszystkie wiadomości zostały wysłane do kolejki 'task_queue'.")
    print("Uruchom 'python notifications/direct_worker.py' aby je przetworzyć.")

def test_notification_queue():
    """Test wysyłania powiadomienia przez kolejkę"""
    print("\n=== TEST 2: Wysyłanie powiadomienia przez kolejkę ===")
    
    from notifications.models import Notification
    
    # Znajdź lub utwórz użytkownika testowego
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'is_active': True
        }
    )
    
    # Utwórz powiadomienie
    notification = Notification.objects.create(
        user=user,
        message="Testowe powiadomienie przez kolejkę RabbitMQ",
        notification_type='system',
        channel='queue',
    )
    
    # Wyślij powiadomienie do kolejki
    message = {
        'notification_id': notification.id,
        'timestamp': datetime.now().isoformat()
    }
    rabbit_client.send_message('notifications', message)
    
    print(f"Utworzono powiadomienie z ID: {notification.id}")
    print("Wiadomość wysłana do kolejki 'notifications'")
    print("Uruchom 'python notifications/notification_worker.py' aby je przetworzyć.")

if __name__ == "__main__":
    print("=== Lab 11: Testowanie systemu kolejkowania ===")
    print("Wybierz test do uruchomienia:")
    print("1. Test bezpośredniego wysyłania przez RabbitMQ (Lab11)")
    print("2. Test wysyłania powiadomień przez kolejkę")
    print("3. Uruchom oba testy")
    
    choice = input("\nWybierz numer testu (1-3): ")
    
    if choice == "1":
        test_direct_rabbit()
    elif choice == "2":
        test_notification_queue()
    elif choice == "3":
        test_direct_rabbit()
        test_notification_queue()
    else:
        print("Nieprawidłowy wybór.")