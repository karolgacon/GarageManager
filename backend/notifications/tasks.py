from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMessage
from backend.settings import (
    DEFAULT_FROM_EMAIL
)
import logging
logger = logging.getLogger(__name__)

@shared_task(bind=True, ignore_result=True)
def send_template_email(self, to_email: str, template_id: str, merge_data: dict = None):

    raw_key = settings.BREVO_API_KEY or ""
    masked = f"{raw_key[:4]}...{raw_key[-4:]}" if len(raw_key) > 8 else raw_key
    logger.info(f"Using Brevo API key: {masked}")
    
    msg = EmailMessage(
        subject=None,
        body=None,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email],
    )

    msg.template_id = template_id
    if merge_data:
        msg.merge_global_data = merge_data

    msg.send()