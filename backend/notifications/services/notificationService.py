from ..repositories.notificationRepository import NotificationRepository
from backend.services.baseService import BaseService
from .queue_service import notification_queue
import logging
from celery import shared_task
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

class NotificationService(BaseService):
    repository = NotificationRepository
    
    @classmethod
    def send_notification(cls, user, message, notification_type, channel='email', 
                          related_object_id=None, related_object_type=None, use_queue=False):
        """
        Tworzy i wysyła powiadomienie
        
        Args:
            user: Obiekt użytkownika
            message: Treść powiadomienia
            notification_type: Typ powiadomienia
            channel: Kanał dostarczenia
            related_object_id: ID powiązanego obiektu
            related_object_type: Typ powiązanego obiektu
            use_queue: Czy użyć kolejki do asynchronicznego przetwarzania
            
        Returns:
            Utworzone powiadomienie
        """
        try:
            # Stwórz obiekt powiadomienia
            notification_data = {
                'user': user,
                'message': message,
                'notification_type': notification_type,
                'channel': channel,
                'related_object_id': related_object_id,
                'related_object_type': related_object_type,
            }
            
            # Zapisz powiadomienie w bazie danych
            notification = cls.repository.create(**notification_data)
            
            # Jeśli ma być przetwarzane przez kolejkę
            if use_queue:
                try:
                    # Zmień kanał na 'queue' dla jasności
                    notification.channel = 'queue'
                    notification.save()
                    
                    # Wyślij do kolejki
                    notification_queue.send_notification(notification)
                    
                    # Oznacz jako wysłane do kolejki
                    notification.queue_message_id = f"notification-{notification.id}"
                    notification.save(update_fields=['queue_message_id'])
                    
                except Exception as e:
                    logger.error(f"Failed to queue notification {notification.id}: {str(e)}")
                    # Nie oznaczaj jako processed - będzie można ponowić później
            
            return notification
            
        except Exception as e:
            logger.error(f"Error creating notification: {str(e)}")
            raise
    
    @classmethod
    def send_service_reminder(cls, vehicle, service_date, description):
        """
        Wysyła przypomnienie o serwisie pojazdu
        
        Args:
            vehicle: Obiekt pojazdu
            service_date: Data serwisu
            description: Opis serwisu
            
        Returns:
            Utworzone powiadomienie
        """
        if not vehicle.owner:
            logger.warning(f"Vehicle {vehicle.id} has no owner, skipping service reminder")
            return None
            
        message = (
            f"Przypominamy o zbliżającym się serwisie pojazdu {vehicle.brand} {vehicle.model} "
            f"({vehicle.registration_number}) zaplanowanym na {service_date}.\n\n"
            f"Szczegóły:\n{description}"
        )
        
        return cls.send_notification(
            user=vehicle.owner,
            message=message,
            notification_type='service_reminder',
            channel='email',  
            related_object_id=vehicle.id,
            related_object_type='Vehicle',
            use_queue=True
        )
