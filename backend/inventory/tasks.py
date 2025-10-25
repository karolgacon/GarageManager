from celery import shared_task
from django.db.models import F
from .models import PartInventory, StockAlert, Part
from notifications.models import Notification
from workshops.models import Workshop
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def check_stock_levels():
    """Sprawdź stany magazynowe i wyślij alerty"""
    
    # Znajdź części z niskim stanem
    low_stock_parts = PartInventory.objects.filter(
        quantity__lte=F('part__minimum_stock_level')
    ).select_related('part', 'workshop')
    
    for inventory in low_stock_parts:
        # Sprawdź czy alert już istnieje
        alert_exists = StockAlert.objects.filter(
            part=inventory.part,
            workshop=inventory.workshop,
            alert_type='low_stock',
            is_resolved=False
        ).exists()
        
        if not alert_exists:
            # Stwórz alert
            alert = StockAlert.objects.create(
                part=inventory.part,
                workshop=inventory.workshop,
                alert_type='low_stock' if inventory.quantity > 0 else 'out_of_stock'
            )
            
            # Wyślij notyfikację do managera warsztatu
            if inventory.workshop.owner:
                notification = Notification.objects.create(
                    user=inventory.workshop.owner,
                    message=f"Niski stan magazynowy: {inventory.part.name} w {inventory.workshop.name}. "
                           f"Pozostało: {inventory.quantity}, minimum: {inventory.part.minimum_stock_level}",
                    notification_type='parts_low_stock',
                    priority='high' if inventory.quantity == 0 else 'medium',
                    related_object_id=alert.id,
                    related_object_type='StockAlert'
                )
                
                # Wyślij powiadomienie real-time przez WebSocket
                from asgiref.sync import async_to_sync
                from notifications.consumers import NotificationConsumer
                
                try:
                    async_to_sync(NotificationConsumer.send_notification_to_user)(
                        inventory.workshop.owner.id,
                        {
                            'id': notification.id,
                            'message': notification.message,
                            'notification_type': notification.notification_type,
                            'priority': notification.priority,
                            'created_at': notification.created_at.isoformat(),
                        }
                    )
                except Exception as e:
                    # Jeśli WebSocket nie działa, powiadomienie zostanie i tak w bazie
                    print(f"Failed to send WebSocket notification: {e}")
    
    return f"Sprawdzono {low_stock_parts.count()} pozycji magazynowych"

@shared_task
def auto_reorder_parts():
    """Automatyczne zamówienie części przy krytycznie niskim stanie"""
    
    # Znajdź części z zerowym stanem
    out_of_stock = PartInventory.objects.filter(
        quantity=0
    ).select_related('part', 'workshop')
    
    suggestions = []
    
    for inventory in out_of_stock:
        if inventory.part.supplier:
            suggestions.append({
                'part': inventory.part.name,
                'supplier': inventory.part.supplier.name,
                'workshop': inventory.workshop.name,
                'suggested_quantity': inventory.part.minimum_stock_level * 2
            })
    
    # W przyszłości: automatyczne zamówienie lub email do managera
    
    return f"Znaleziono {len(suggestions)} części do uzupełnienia"