import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

app.config_from_object('django.conf:settings', namespace='CELERY')

# Konfiguracja periodic tasks
app.conf.beat_schedule = {
    'update-appointment-statuses': {
        'task': 'appointments.tasks.update_appointment_statuses',
        'schedule': crontab(minute='*/15'),  # Uruchamiaj co 15 minut
    },
}

app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')