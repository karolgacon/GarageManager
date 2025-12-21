from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from notifications.models import Notification
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Tworzy przykładowe powiadomienia dla testowania systemu'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Liczba powiadomień do utworzenia (domyślnie 20)',
        )
        parser.add_argument(
            '--user-email',
            type=str,
            help='Email użytkownika dla którego utworzyć powiadomienia (domyślnie wszystkich użytkowników)',
        )

    def handle(self, *args, **options):
        count = options['count']
        user_email = options['user_email']

        # Pobierz użytkowników
        if user_email:
            try:
                users = [User.objects.get(email=user_email)]
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Użytkownik o emailu {user_email} nie istnieje')
                )
                return
        else:
            users = list(User.objects.all())
            if not users:
                self.stdout.write(
                    self.style.ERROR('Brak użytkowników w systemie')
                )
                return

        # Przykładowe powiadomienia z różnymi typami i priorytetami
        notification_templates = [
            {
                'notification_type': 'appointment_reminder',
                'message': 'Przypomnienie: Twoja wizyta w warsztacie jest zaplanowana na jutro o godzinie 10:00.',
                'priority': 'high',
                'channel': 'email',
                'action_url': '/appointments/123',
            },
            {
                'notification_type': 'repair_status',
                'message': 'Status naprawy Twojego pojazdu został zaktualizowany. Naprawa została ukończona.',
                'priority': 'medium',
                'channel': 'push',
                'action_url': '/repairs/456',
            },
            {
                'notification_type': 'invoice',
                'message': 'Nowa faktura #INV-2024-001 została wygenerowana. Kwota do zapłaty: 450 PLN.',
                'priority': 'high',
                'channel': 'email',
                'action_url': '/invoices/789',
            },
            {
                'notification_type': 'promotional',
                'message': 'Promocja! Wymiana opon -20%. Oferta ważna do końca miesiąca.',
                'priority': 'low',
                'channel': 'push',
                'action_url': '/promotions/winter-tires',
            },
            {
                'notification_type': 'system',
                'message': 'System będzie niedostępny w nocy z 15 na 16 grudnia z powodu konserwacji.',
                'priority': 'medium',
                'channel': 'email',
            },
            {
                'notification_type': 'service_reminder',
                'message': 'Przypomnienie o serwisie: Twój pojazd wymaga przeglądu technicznego w ciągu 30 dni.',
                'priority': 'medium',
                'channel': 'email',
                'action_url': '/service/schedule',
            },
            {
                'notification_type': 'chat_message',
                'message': 'Masz nową wiadomość od mechanika Andrzej Kowalski.',
                'priority': 'medium',
                'channel': 'push',
                'action_url': '/chat/456',
            },
            {
                'notification_type': 'ai_diagnosis_ready',
                'message': 'Diagnoza AI Twojego pojazdu jest gotowa. Wykryto potencjalne problemy z hamulcami.',
                'priority': 'high',
                'channel': 'email',
                'action_url': '/diagnosis/789',
            },
            {
                'notification_type': 'parts_low_stock',
                'message': 'Uwaga: Niski stan magazynowy części zamiennych dla Twojego pojazdu.',
                'priority': 'medium',
                'channel': 'email',
                'action_url': '/inventory/low-stock',
            },
            {
                'notification_type': 'supplier_delivery',
                'message': 'Dostawa części zamiennych została dostarczona. Twoja naprawa może zostać kontynuowana.',
                'priority': 'medium',
                'channel': 'push',
                'action_url': '/repairs/pending',
            },
            {
                'notification_type': 'payment_reminder',
                'message': 'Przypomnienie o płatności: Faktura #INV-2024-002 oczekuje na płatność (termin: 3 dni).',
                'priority': 'high',
                'channel': 'email',
                'action_url': '/billing/overdue',
            },
            {
                'notification_type': 'service_feedback_request',
                'message': 'Jak oceniasz naszą usługę? Zostaw opinię o ostatniej wizycie w warsztacie.',
                'priority': 'low',
                'channel': 'email',
                'action_url': '/feedback/create',
            },
        ]

        created_notifications = []
        
        for i in range(count):
            # Wybierz losowego użytkownika i szablon powiadomienia
            user = random.choice(users)
            template = random.choice(notification_templates)
            
            # Ustaw losowy czas utworzenia (ostatnie 30 dni)
            created_at = timezone.now() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Losowo ustaw status przeczytania (30% szans na przeczytane)
            is_read = random.random() < 0.3
            read_at = None
            if is_read:
                read_at = created_at + timedelta(
                    hours=random.randint(1, 48),
                    minutes=random.randint(0, 59)
                )
            
            # Utwórz powiadomienie
            notification = Notification.objects.create(
                user=user,
                message=template['message'],
                notification_type=template['notification_type'],
                priority=template['priority'],
                channel=template['channel'],
                action_url=template.get('action_url'),
                read_status=is_read,
                read_at=read_at,
                created_at=created_at,
                related_object_id=random.randint(1, 1000) if template.get('action_url') else None,
                related_object_type=template['notification_type'].split('_')[0] if template.get('action_url') else None,
                processed=random.choice([True, False]),
            )
            
            created_notifications.append(notification)

        self.stdout.write(
            self.style.SUCCESS(
                f'Pomyślnie utworzono {len(created_notifications)} przykładowych powiadomień'
            )
        )
        
        # Wyświetl statystyki
        total_users = len(set(n.user for n in created_notifications))
        read_count = sum(1 for n in created_notifications if n.read_status)
        unread_count = len(created_notifications) - read_count
        
        self.stdout.write(f'Statystyki:')
        self.stdout.write(f'  - Użytkownicy: {total_users}')
        self.stdout.write(f'  - Przeczytane: {read_count}')
        self.stdout.write(f'  - Nieprzeczytane: {unread_count}')
        
        # Statystyki według typu
        type_stats = {}
        for notification in created_notifications:
            type_name = dict(Notification.NOTIFICATION_TYPES)[notification.notification_type]
            type_stats[type_name] = type_stats.get(type_name, 0) + 1
        
        self.stdout.write(f'Typy powiadomień:')
        for type_name, count in type_stats.items():
            self.stdout.write(f'  - {type_name}: {count}')