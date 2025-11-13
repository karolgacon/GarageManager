# Generated manually to migrate existing appointment statuses
from django.db import migrations


def migrate_appointment_statuses_forward(apps, schema_editor):
    Appointment = apps.get_model('appointments', 'Appointment')
    
    # Mapowanie starych statusów na nowe
    status_mapping = {
        'pending': 'scheduled',
        'confirmed': 'scheduled',  
        'in_progress': 'in_progress',  # bez zmian
        'completed': 'completed',      # bez zmian
        'cancelled': 'scheduled',      # anulowane traktujemy jako zaplanowane do ponownej oceny
    }
    
    for old_status, new_status in status_mapping.items():
        Appointment.objects.filter(status=old_status).update(status=new_status)


def migrate_appointment_statuses_reverse(apps, schema_editor):
    # Reverse migration - mapuj nowe statusy z powrotem
    Appointment = apps.get_model('appointments', 'Appointment')
    
    # Prosty reverse mapping - wszystko co zaplanowane -> pending
    Appointment.objects.filter(status='scheduled').update(status='pending')


class Migration(migrations.Migration):

    dependencies = [
        ('appointments', '0004_update_appointment_status_choices'),
    ]

    operations = [
        migrations.RunPython(
            migrate_appointment_statuses_forward,
            migrate_appointment_statuses_reverse,
        ),
    ]