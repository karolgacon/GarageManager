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

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from notifications.models import Notification

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)
User = get_user_model()

def send_email_notification(to_email, subject, content):
    """Wysyła email (symulacja)"""
    logger.info(f"Sending email to {to_email}")
    logger.info(f"Subject: {subject}")
    logger.info(f"Content: {content}")

    time.sleep(1)

    logger.info(f"Email sent to {to_email}")
    return True

def process_notification(ch, method, properties, body):
    """Przetwarza powiadomienie z kolejki"""
    try:

        message = json.loads(body)
        logger.info(f"Received message: {message}")

        notification_id = message.get('notification_id')

        try:
            notification = Notification.objects.get(id=notification_id)
        except Notification.DoesNotExist:
            logger.error(f"Notification with ID {notification_id} not found")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        if notification.processed:
            logger.info(f"Notification {notification_id} already processed")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        try:
            user = notification.user
        except:
            logger.error(f"User not found for notification {notification_id}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        if notification.notification_type == 'service_reminder':
            subject = "Przypomnienie o serwisie pojazdu"
        else:
            subject = f"Powiadomienie GarageManager - {notification.notification_type}"

        effective_channel = 'email' if notification.channel == 'queue' else notification.channel

        if effective_channel == 'email':
            send_email_notification(user.email, subject, notification.message)
        elif effective_channel == 'sms':
            logger.info(f"SMS notification would be sent to user {user.id}")
        elif effective_channel == 'push':
            logger.info(f"Push notification would be sent to user {user.id}")
        else:
            logger.warning(f"Unsupported channel: {effective_channel}")

        notification.processed = True
        notification.save(update_fields=['processed'])

        ch.basic_ack(delivery_tag=method.delivery_tag)
        logger.info(f"Notification {notification_id} processed successfully")

    except Exception as e:
        logger.error(f"Error processing notification: {str(e)}")

        if getattr(method, 'delivery_tag', 0) < 3:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        else:
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    """Główna funkcja workera"""

    host = os.environ.get('RABBITMQ_HOST', 'localhost')
    username = os.environ.get('RABBITMQ_USER', 'garage')
    password = os.environ.get('RABBITMQ_PASS', 'garage123')
    queue_name = 'notifications'

    credentials = pika.PlainCredentials(username, password)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=host, credentials=credentials)
    )
    channel = connection.channel()

    channel.queue_declare(queue=queue_name, durable=True)

    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(queue=queue_name, on_message_callback=process_notification)

    logger.info(f'Worker started. Waiting for notifications on queue "{queue_name}".')

    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logger.info('Interrupted by user. Shutting down...')
        sys.exit(0)