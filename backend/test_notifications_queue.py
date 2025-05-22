import os
import django
import sys
import json
import pika
import time

# Konfiguracja środowiska Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from datetime import datetime
import logging

User = get_user_model()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_rabbitmq_connection():
    """Ustanawia połączenie z RabbitMQ"""
    # Pobierz dane połączenia ze zmiennych środowiskowych lub użyj domyślnych wartości
    host = os.environ.get('RABBITMQ_HOST', 'rabbitmq')  # 'rabbitmq' jako nazwa hosta w docker-compose
    user = os.environ.get('RABBITMQ_USER', 'garage')
    password = os.environ.get('RABBITMQ_PASS', 'garage123')
    
    print(f"Łączenie z RabbitMQ na hoście: {host} z użytkownikiem: {user}")
    
    credentials = pika.PlainCredentials(user, password)
    parameters = pika.ConnectionParameters(
        host=host,
        credentials=credentials,
        connection_attempts=3,
        retry_delay=5
    )
    
    try:
        connection = pika.BlockingConnection(parameters)
        print("Połączono z RabbitMQ!")
        return connection
    except Exception as e:
        print(f"Błąd połączenia z RabbitMQ: {str(e)}")
        # Spróbuj z localhost jeśli nie udało się połączyć z nazwą hosta
        if host != 'localhost':
            print("Próba połączenia z localhost...")
            parameters = pika.ConnectionParameters(
                host='localhost',
                credentials=credentials,
                connection_attempts=3,
                retry_delay=2
            )
            connection = pika.BlockingConnection(parameters)
            print("Połączono z RabbitMQ na localhost!")
            return connection
        raise

def test_direct_rabbit():
    """Test bezpośredniego wysyłania wiadomości przez RabbitMQ (Lab11)"""
    print("\n=== TEST 1: Bezpośrednie wysyłanie wiadomości przez RabbitMQ ===")
    
    try:
        # Uzyskaj połączenie
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Deklaruj kolejkę - musi być zrobione zarówno przez producenta jak i konsumenta
        channel.queue_declare(queue='task_queue', durable=True)
        
        # Przykładowe wiadomości z kropkami dla symulacji opóźnienia (każda kropka = 1 sekunda opóźnienia)
        messages = [
            "Zadanie 1: Krótkie zadanie.",
            "Zadanie 2: Średnie zadanie...",
            "Zadanie 3: Długie zadanie.........",
            "Zadanie 4: Bardzo długie zadanie..................",
        ]
        
        # Wyślij wiadomości z opóźnieniem pomiędzy nimi
        for idx, msg in enumerate(messages):
            # Wyjaśnij użytkownikowi, że kropki reprezentują czas przetwarzania
            dots = msg.count('.')
            processing_time = dots if dots > 0 else 1  # Minimum 1 sekunda
            
            channel.basic_publish(
                exchange='',
                routing_key='task_queue',
                body=msg.encode(),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # trwałe wiadomości
                )
            )
            print(f"Wysłano: {msg}")
            print(f"Czas przetwarzania: {processing_time} sekund (1 sekunda na każdą kropkę)")
            
            # Dodaj małe opóźnienie pomiędzy wysyłaniem wiadomości, aby były widoczne w panelu
            if idx < len(messages) - 1:
                print(f"Czekam 1 sekundę przed wysłaniem kolejnej wiadomości...")
                time.sleep(1)
        
        print("Wszystkie wiadomości zostały wysłane do kolejki 'task_queue'.")
        
        # Zamknij połączenie
        connection.close()
        
        # Dodaj informację o dalszych krokach
        print("\n** Aby zobaczyć kolejkę w RabbitMQ, przejdź do panelu zarządzania: **")
        print("- http://localhost:15672/ (login: garage, hasło: garage123)")
        print("- Sprawdź zakładkę 'Queues' - powinna być tam kolejka 'task_queue' z wysłanymi wiadomościami")
        print("\n** Aby obserwować przetwarzanie wiadomości, uruchom konsumenta (opcja 3) **")
        
    except Exception as e:
        print(f"Błąd podczas testu: {str(e)}")

def test_notification_queue():
    """Test wysyłania powiadomienia przez kolejkę"""
    print("\n=== TEST 2: Wysyłanie powiadomienia przez kolejkę ===")
    
    try:
        # Uzyskaj połączenie
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Deklaruj kolejkę - musi być zrobione zarówno przez producenta jak i konsumenta
        channel.queue_declare(queue='notifications', durable=True)
        
        # Przygotuj kilka powiadomień z różnymi danymi i priorytetami
        notifications = [
            {
                'user_id': 1,
                'message': "Powiadomienie zwykłe",
                'notification_type': 'system',
                'priority': 'normal',
                'processing_time': 1,  # 1 sekunda
                'timestamp': datetime.now().isoformat()
            },
            {
                'user_id': 2,
                'message': "Powiadomienie ważne",
                'notification_type': 'user',
                'priority': 'high',
                'processing_time': 3,  # 3 sekundy
                'timestamp': datetime.now().isoformat()
            },
            {
                'user_id': 3,
                'message': "Powiadomienie krytyczne",
                'notification_type': 'appointment',
                'priority': 'critical',
                'processing_time': 5,  # 5 sekund
                'timestamp': datetime.now().isoformat()
            }
        ]
        
        # Wyślij każde powiadomienie z opóźnieniem
        for idx, notification in enumerate(notifications):
            channel.basic_publish(
                exchange='',
                routing_key='notifications',
                body=json.dumps(notification).encode(),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # trwałe wiadomości
                )
            )
            
            print(f"Wysłano powiadomienie: {notification['message']} (priorytet: {notification['priority']})")
            print(f"Czas przetwarzania: {notification['processing_time']} sekund")
            
            # Dodaj małe opóźnienie pomiędzy wysyłaniem powiadomień
            if idx < len(notifications) - 1:
                print(f"Czekam 1 sekundę przed wysłaniem kolejnego powiadomienia...")
                time.sleep(1)
        
        print("Wszystkie powiadomienia zostały wysłane do kolejki 'notifications'")
        
        # Zamknij połączenie
        connection.close()
        
        # Dodaj informację o dalszych krokach
        print("\n** Aby zobaczyć kolejkę w RabbitMQ, przejdź do panelu zarządzania: **")
        print("- http://localhost:15672/ (login: garage, hasło: garage123)")
        print("- Sprawdź zakładkę 'Queues' - powinna być tam kolejka 'notifications'")
        
        # Dodaj prosty przykład konsumenta
        print("\n** Przykład konsumenta (możesz skopiować do pliku notification_worker.py): **")
        print("""
import os
import pika
import json
import time

def callback(ch, method, properties, body):
    try:
        # Dekoduj wiadomość
        message = json.loads(body.decode())
        print(f"Otrzymano powiadomienie: {message['message']} (priorytet: {message.get('priority', 'normal')})")
        
        # Symuluj przetwarzanie - użyj pola processing_time lub domyślnie 1 sekunda
        processing_time = message.get('processing_time', 1)
        print(f"Przetwarzanie zajmie {processing_time} sekund...")
        
        # Symulacja przetwarzania
        for i in range(processing_time):
            print(f"Przetwarzanie: {i+1}/{processing_time} sekund")
            time.sleep(1)
        
        print(f"Powiadomienie przetworzone! ID użytkownika: {message.get('user_id')}")
        
        # Potwierdzenie przetworzenia wiadomości
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Błąd podczas przetwarzania: {str(e)}")
        # W przypadku błędu możemy odrzucić wiadomość (requeue=False) lub umieścić ją z powrotem w kolejce (requeue=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

# Pobierz dane połączenia ze zmiennych środowiskowych lub użyj domyślnych wartości
host = os.environ.get('RABBITMQ_HOST', 'localhost')
user = os.environ.get('RABBITMQ_USER', 'garage')
password = os.environ.get('RABBITMQ_PASS', 'garage123')

# Uzyskaj połączenie
print(f"Łączenie z RabbitMQ na hoście: {host}")
credentials = pika.PlainCredentials(user, password)
parameters = pika.ConnectionParameters(host=host, credentials=credentials)
connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Deklaruj kolejkę
channel.queue_declare(queue='notifications', durable=True)

# Ustaw tylko 1 wiadomość naraz dla każdego konsumenta
channel.basic_qos(prefetch_count=1)

# Zarejestruj konsumenta
channel.basic_consume(queue='notifications', on_message_callback=callback)

print("Oczekiwanie na powiadomienia. Aby zakończyć naciśnij CTRL+C")
channel.start_consuming()
        """)
        
    except Exception as e:
        print(f"Błąd podczas testu: {str(e)}")

def test_consumer():
    """Prosty konsument odbierający wiadomości z opóźnieniami przetwarzania"""
    print("\n=== TEST 3: Konsument odbierający wiadomości ===")
    
    try:
        # Uzyskaj połączenie
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Deklaruj kolejkę
        channel.queue_declare(queue='task_queue', durable=True)
        
        def callback(ch, method, properties, body):
            message = body.decode()
            print(f"Otrzymano: {message}")
            
            # Symuluj pracę na podstawie liczby kropek w wiadomości
            dots = message.count('.')
            processing_time = dots if dots > 0 else 1  # Minimum 1 sekunda
            
            print(f"Rozpoczynam przetwarzanie, które zajmie {processing_time} sekund...")
            
            # Pokaż postęp przetwarzania
            for i in range(processing_time):
                progress = (i + 1) / processing_time * 100
                print(f"Przetwarzanie: {i+1}/{processing_time} sekund [{progress:.1f}%]")
                time.sleep(1)
            
            print(f"Zadanie wykonane po {processing_time} sekundach!")
            print("=" * 50)  # Linia oddzielająca dla czytelności
            
            # Potwierdzenie przetworzenia
            ch.basic_ack(delivery_tag=method.delivery_tag)
        
        # Ustaw tylko 1 wiadomość naraz
        channel.basic_qos(prefetch_count=1)
        
        # Zarejestruj konsumenta
        channel.basic_consume(queue='task_queue', on_message_callback=callback)
        
        print("Konsument uruchomiony. Oczekiwanie na wiadomości. Aby zakończyć naciśnij CTRL+C")
        print("Każda kropka w wiadomości oznacza 1 sekundę przetwarzania")
        print("=" * 50)  # Linia oddzielająca dla czytelności
        
        # Rozpocznij nasłuchiwanie (blokujące)
        channel.start_consuming()
        
    except KeyboardInterrupt:
        print("Konsument zatrzymany przez użytkownika")
        if connection and connection.is_open:
            connection.close()
    except Exception as e:
        print(f"Błąd konsumenta: {str(e)}")
        if connection and connection.is_open:
            connection.close()

def test_notification_consumer():
    """Konsument odbierający powiadomienia"""
    print("\n=== TEST 4: Konsument powiadomień ===")
    
    try:
        # Uzyskaj połączenie
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Deklaruj kolejkę
        channel.queue_declare(queue='notifications', durable=True)
        
        def callback(ch, method, properties, body):
            try:
                # Dekoduj wiadomość
                message = json.loads(body.decode())
                print(f"Otrzymano powiadomienie: {message['message']} (priorytet: {message.get('priority', 'normal')})")
                
                # Symuluj przetwarzanie - użyj pola processing_time lub domyślnie 1 sekunda
                processing_time = message.get('processing_time', 1)
                print(f"Przetwarzanie zajmie {processing_time} sekund...")
                
                # Symulacja przetwarzania
                for i in range(processing_time):
                    progress = (i + 1) / processing_time * 100
                    print(f"Przetwarzanie: {i+1}/{processing_time} sekund [{progress:.1f}%]")
                    time.sleep(1)
                
                print(f"Powiadomienie przetworzone! ID użytkownika: {message.get('user_id')}")
                print("=" * 50)  # Linia oddzielająca dla czytelności
                
                # Potwierdzenie przetworzenia wiadomości
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                print(f"Błąd podczas przetwarzania: {str(e)}")
                # W przypadku błędu możemy odrzucić wiadomość
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        
        # Ustaw tylko 1 wiadomość naraz
        channel.basic_qos(prefetch_count=1)
        
        # Zarejestruj konsumenta
        channel.basic_consume(queue='notifications', on_message_callback=callback)
        
        print("Konsument powiadomień uruchomiony. Oczekiwanie na wiadomości. Aby zakończyć naciśnij CTRL+C")
        print("=" * 50)  # Linia oddzielająca dla czytelności
        
        # Rozpocznij nasłuchiwanie (blokujące)
        channel.start_consuming()
        
    except KeyboardInterrupt:
        print("Konsument zatrzymany przez użytkownika")
        if connection and connection.is_open:
            connection.close()
    except Exception as e:
        print(f"Błąd konsumenta: {str(e)}")
        if connection and connection.is_open:
            connection.close()

if __name__ == "__main__":
    print("=== Lab 11: Testowanie systemu kolejkowania ===")
    print("Wybierz test do uruchomienia:")
    print("1. Test wysyłania wiadomości do kolejki (producent)")
    print("2. Test wysyłania powiadomień do kolejki")
    print("3. Uruchom konsumenta dla zwykłych wiadomości")
    print("4. Uruchom konsumenta dla powiadomień")
    print("5. Uruchom oba testy wysyłania (1+2)")
    
    choice = input("\nWybierz numer testu (1-5): ")
    
    if choice == "1":
        test_direct_rabbit()
    elif choice == "2":
        test_notification_queue()
    elif choice == "3":
        test_consumer()
    elif choice == "4":
        test_notification_consumer()
    elif choice == "5":
        test_direct_rabbit()
        test_notification_queue()
    else:
        print("Nieprawidłowy wybór.")