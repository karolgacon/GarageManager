from celery import shared_task
from .models import Appointment
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task
def update_appointment_statuses():
    """
    Zadanie Celery do automatycznej aktualizacji statusów appointments
    """
    try:
        logger.info("Rozpoczęcie automatycznej aktualizacji statusów appointments")
        Appointment.update_all_statuses()
        logger.info("Automatyczna aktualizacja statusów zakończona pomyślnie")
        return "Statusy zostały zaktualizowane"
    except Exception as e:
        logger.error(f"Błąd podczas aktualizacji statusów: {str(e)}")
        raise