import pika
import json
import os
import logging

logger = logging.getLogger(__name__)

class RabbitMQClient:
    """
    Bezpośredni klient RabbitMQ zgodnie z przykładem z Lab11
    """
    def __init__(self):
        self.host = os.environ.get('RABBITMQ_HOST', 'localhost')
        self.user = os.environ.get('RABBITMQ_USER', 'garage')
        self.password = os.environ.get('RABBITMQ_PASS', 'garage123')
        self.connection = None
        self.channel = None

    def connect(self):
        """Utworzenie połączenia z RabbitMQ"""
        if not self.connection or self.connection.is_closed:
            try:
                credentials = pika.PlainCredentials(self.user, self.password)
                parameters = pika.ConnectionParameters(
                    host=self.host,
                    credentials=credentials
                )
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()
                logger.info(f"Connected to RabbitMQ at {self.host}")
            except Exception as e:
                logger.error(f"Error connecting to RabbitMQ: {str(e)}")
                raise
        return self.channel

    def close(self):
        """Zamknięcie połączenia"""
        if self.connection and self.connection.is_open:
            self.connection.close()
            self.connection = None
            self.channel = None

    def send_message(self, queue, message, persistent=True):
        """
        Wysyłanie wiadomości do kolejki

        Args:
            queue (str): Nazwa kolejki
            message (dict): Wiadomość do wysłania
            persistent (bool): Czy wiadomość ma być trwała
        """
        try:
            channel = self.connect()

            channel.queue_declare(queue=queue, durable=True)

            properties = pika.BasicProperties(
                delivery_mode=2 if persistent else 1,
                content_type='application/json'
            )

            message_body = json.dumps(message) if isinstance(message, dict) else message

            channel.basic_publish(
                exchange='',
                routing_key=queue,
                body=message_body,
                properties=properties
            )

            logger.info(f"Message sent to queue '{queue}': {message}")
            return True
        except Exception as e:
            logger.error(f"Error sending message to queue '{queue}': {str(e)}")
            raise
        finally:
            self.close()

rabbit_client = RabbitMQClient()

notification_queue = rabbit_client