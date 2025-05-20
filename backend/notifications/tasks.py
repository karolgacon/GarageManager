from celery import shared_task
import logging
from .services.notificationService import NotificationService
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

@shared_task
def send_queued_notifications():
    """Zadanie Celery do wysyłania powiadomień z kolejki"""
    unsent_notifications = Notification.objects.filter(
        processed=False,
        channel='queue'
    )
    
    count = 0
    for notification in unsent_notifications:
        try:
            # Wyślij powiadomienie do kolejki
            from .services.queue_service import notification_queue
            notification_queue.send_message(
                'notifications',
                {
                    'notification_id': notification.id,
                    'timestamp': notification.created_at.isoformat()
                }
            )
            count += 1
        except Exception as e:
            logger.error(f"Failed to queue notification {notification.id}: {str(e)}")
    
    return f"Queued {count} notifications"

@shared_task
def send_notification(user_id, message, notification_type, channel='email'):
    """
    Task Celery do wysyłania powiadomień
    """
    try:
        user = User.objects.get(id=user_id)
        notification = Notification.objects.create(
            user=user,
            message=message,
            notification_type=notification_type,
            channel=channel,
            read_status=False
        )
        
        # Symulacja wysyłania powiadomienia
        logger.info(f"Sending {channel} notification to {user.username}: {message}")
        
        # W rzeczywistej implementacji, tutaj byłby kod do wysyłki emaila/SMS/push
        import time
        time.sleep(2)  # Symulacja opóźnienia wysyłki
        
        # Oznacz jako przetworzone
        notification.processed = True
        notification.save()
        
        logger.info(f"Notification {notification.id} sent successfully")
        return f"Notification {notification.id} sent"
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} not found")
        return f"Error: User with ID {user_id} not found"
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def send_service_reminder(vehicle_id, service_date, description):
    """Zadanie do wysyłania przypomnienia o serwisie pojazdu"""
    from vehicles.models import Vehicle
    
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
        result = NotificationService.send_service_reminder(
            vehicle=vehicle,
            service_date=service_date,
            description=description
        )
        return f"Service reminder sent for vehicle {vehicle_id}"
    except Vehicle.DoesNotExist:
        logger.error(f"Vehicle with ID {vehicle_id} not found")
        return f"Error: Vehicle {vehicle_id} not found"
    except Exception as e:
        logger.error(f"Error sending service reminder: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def send_service_reminder_async(vehicle_id, service_date, description):
    """Zadanie asynchroniczne do wysyłania przypomnienia o serwisie"""
    from vehicles.models import Vehicle
    
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
        result = NotificationService.send_service_reminder(
            vehicle=vehicle,
            service_date=service_date,
            description=description
        )
        return f"Service reminder sent for vehicle {vehicle_id}"
    except Vehicle.DoesNotExist:
        logger.error(f"Vehicle with ID {vehicle_id} not found")
        return f"Error: Vehicle {vehicle_id} not found"
    except Exception as e:
        logger.error(f"Error sending service reminder: {str(e)}")
        return f"Error: {str(e)}"

@shared_task
def send_notification_async(user_id, message, notification_type, channel='email', 
                        related_object_id=None, related_object_type=None):
    """Zadanie asynchroniczne do wysyłania powiadomienia"""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    try:
        user = User.objects.get(id=user_id)
        result = NotificationService.send_notification(
            user=user,
            message=message,
            notification_type=notification_type,
            channel=channel,
            related_object_id=related_object_id,
            related_object_type=related_object_type,
            use_queue=True
        )
        return f"Notification created with ID {result.id}"
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} not found")
        return f"Error: User with ID {user_id} not found"
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        return f"Error: {str(e)}"