import os
import sys
import django
import json
import time
import logging
import pika

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

def process_message(ch, method, properties, body):
    """Przetwarzanie wiadomości z kolejki (zgodnie z przykładem z Lab11)"""
    try:
        content = body.decode('utf-8')
        logger.info(f"[.] Otrzymano: '{content}'")

        secs = content.count('.') if '.' in content else 1
        time.sleep(secs)

        logger.info(f"[v] Skończono: '{content}'")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")

        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def run_worker():
    """Uruchomienie workera"""

    host = os.environ.get('RABBITMQ_HOST', 'localhost')
    user = os.environ.get('RABBITMQ_USER', 'garage')
    password = os.environ.get('RABBITMQ_PASS', 'garage123')
    queue_name = 'task_queue'

    credentials = pika.PlainCredentials(user, password)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=host, credentials=credentials)
    )
    channel = connection.channel()

    channel.queue_declare(queue=queue_name, durable=True)

    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(
        queue=queue_name,
        on_message_callback=process_message
    )

    logger.info(f"[x] Oczekiwanie na wiadomości w {queue_name}. Aby zakończyć naciśnij CTRL+C")

    channel.start_consuming()

if __name__ == "__main__":
    try:
        run_worker()
    except KeyboardInterrupt:
        logger.info("Worker przerwany przez użytkownika")