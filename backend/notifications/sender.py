import os
import sys
import pika
import logging
import argparse

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def send_message(message=None):
    """Wysyłanie wiadomości do kolejki (zgodnie z Lab11)"""
    try:
        # Konfiguracja RabbitMQ
        host = os.environ.get('RABBITMQ_HOST', 'localhost')
        user = os.environ.get('RABBITMQ_USER', 'garage')
        password = os.environ.get('RABBITMQ_PASS', 'garage123')
        
        # Połączenie z RabbitMQ
        credentials = pika.PlainCredentials(user, password)
        conn = pika.BlockingConnection(
            pika.ConnectionParameters(host=host, credentials=credentials)
        )
        channel = conn.create_channel()  # Poprawiona nazwa metody
        
        # Nazwa kolejki zgodna z Lab11
        queue = 'task_queue'
        
        # Deklaruj kolejkę jako trwałą
        channel.queue_declare(queue=queue, durable=True)
        
        # Przygotuj wiadomość
        msg = message or "Hello World!"
        
        # Wyślij wiadomość jako trwałą
        channel.basic_publish(
            exchange='',
            routing_key=queue,
            body=msg,
            properties=pika.BasicProperties(
                delivery_mode=2  # persistent message
            )
        )
        
        logger.info(f"[x] Wysłano: '{msg}'")
        
        # Zamknij połączenie
        conn.close()
        
        return True
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Wyślij wiadomość do kolejki RabbitMQ')
    parser.add_argument('message', nargs='*', default=['Hello', 'World'], 
                        help='Wiadomość do wysłania (domyślnie "Hello World")')
    
    args = parser.parse_args()
    message = ' '.join(args.message)
    
    send_message(message)