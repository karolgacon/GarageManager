import os
import sys
import django
import json
import time
import logging
import pika
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

# Konfiguracja środowiska Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.models import Notification

# Konfiguracja logowania
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)
User = get_user_model()

# Funkcja do wysyłania emaili (symulacja)
def send_email_notification(to_email, subject, content):
    """Wysyła email (symulacja)"""
    logger.info(f"Sending email to {to_email}")
    logger.info(f"Subject: {subject}")
    logger.info(f"Content: {content}")
    
    # Symuluj opóźnienie
    time.sleep(1)
    
    logger.info(f"Email sent to {to_email}")
    return True

# Callback do przetwarzania wiadomości
def process_notification(ch, method, properties, body):
    """Przetwarza powiadomienie z kolejki"""
    try:
        # Parsowanie wiadomości JSON
        message = json.loads(body)
        logger.info(f"Received message: {message}")
        
        # Pobierz dane powiadomienia
        notification_id = message.get('notification_id')
        
        # Sprawdź, czy powiadomienie istnieje w bazie
        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            logger.error(f"Notification with ID {notification_id} not found")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return
        
        # Sprawdź czy powiadomienie nie zostało już przetworzone
        if notification.processed:
            logger.info(f"Notification {notification_id} already processed")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
            
        # Pobierz użytkownika
        try:
            user = notification.user
        except:
            logger.error(f"User not found for notification {notification_id}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return
            
        # Przygotowanie i wysłanie powiadomienia
        if notification.notification_type == 'service_reminder':
            subject = "Przypomnienie o serwisie pojazdu"
        else:
            subject = f"Powiadomienie GarageManager - {notification.notification_type}"
            
        # Wysyłka w zależności od kanału
        # Mimo że kanał może być 'queue', używamy oryginalnego kanału dostarczenia
        effective_channel = 'email' if notification.channel == 'queue' else notification.channel
        
        if effective_channel == 'email':
            send_email_notification(user.email, subject, notification.message)
        elif effective_channel == 'sms':
            logger.info(f"SMS notification would be sent to user {user.id}")
        elif effective_channel == 'push':
            logger.info(f"Push notification would be sent to user {user.id}")
        else:
            logger.warning(f"Unsupported channel: {effective_channel}")
            
        # Oznacz powiadomienie jako przetworzone
        notification.processed = True
        notification.save(update_fields=['processed'])
        
        # Potwierdzenie przetworzenia wiadomości
        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Notification {notification_id} processed successfully")
        
    except Exception as e:
        logger.error(f"Error processing notification: {str(e)}")
        # Odmowa i ponowne dodanie do kolejki (max 3 próby)
        if getattr(method, 'delivery_tag', 0) < 3:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        else:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    """Główna funkcja workera"""
    # Konfiguracja RabbitMQ z parametrami środowiskowymi
    host = os.environ.get('RABBITMQ_HOST', 'localhost')
    username = os.environ.get('RABBITMQ_USER', 'garage')
    password = os.environ.get('RABBITMQ_PASS', 'garage123')
    queue_name = 'notifications'
    
    # Ustanowienie połączenia
    credentials = pika.PlainCredentials(username, password)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=host, credentials=credentials)
    )
    channel = connection.channel()
    
    # Deklaracja kolejki jako trwałej
    channel.queue_declare(queue=queue_name, durable=True)
    
    # Ustawienie prefetch count na 1
    channel.basic_qos(prefetch_count=1)
    
    # Ustawienie callbacka do konsumowania wiadomości
    channel.basic_consume(queue=queue_name, on_message_callback=process_notification)
    
    logger.info(f'Worker started. Waiting for notifications on queue "{queue_name}".')
    
    # Rozpoczęcie nasłuchiwania
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info('Interrupted by user. Shutting down...')
        sys.exit(0)