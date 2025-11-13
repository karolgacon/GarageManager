from django.core.management.base import BaseCommand
from appointments.models import Appointment

class Command(BaseCommand):
    help = 'Aktualizuje statusy wszystkich appointments na podstawie daty'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Rozpoczęcie aktualizacji statusów appointments...')
        )
        
        try:
            Appointment.update_all_statuses()
            self.stdout.write(
                self.style.SUCCESS('Statusy zostały zaktualizowane pomyślnie!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Błąd podczas aktualizacji statusów: {str(e)}')
            )