from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from notifications.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Usuwa wszystkie powiadomienia z systemu'

    def add_arguments(self, parser):
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email użytkownika którego powiadomienia usunąć (domyślnie wszystkich użytkowników)',
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Potwierdź usunięcie bez dodatkowych pytań',
        )

    def handle(self, *args, **options):
        user_email = options['user_email']
        confirm = options['confirm']

        # Pobierz powiadomienia do usunięcia
        if user_email:
            try:
                user = User.objects.get(email=user_email)
                notifications = Notification.objects.filter(user=user)
                scope = f'dla użytkownika {user_email}'
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Użytkownik o emailu {user_email} nie istnieje')
                )
                return
        else:
            notifications = Notification.objects.all()
            scope = 'dla wszystkich użytkowników'

        count = notifications.count()
        
        if count == 0:
            self.stdout.write(
                self.style.WARNING(f'Brak powiadomień do usunięcia {scope}')
            )
            return

        # Potwierdzenie usunięcia
        if not confirm:
            self.stdout.write(
                f'Znaleziono {count} powiadomień {scope}.'
            )
            response = input('Czy na pewno chcesz je usunąć? (tak/nie): ')
            if response.lower() not in ['tak', 'yes', 'y']:
                self.stdout.write('Anulowano usunięcie.')
                return

        # Usuń powiadomienia
        deleted_count, _ = notifications.delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Pomyślnie usunięto {deleted_count} powiadomień {scope}'
            )
        )