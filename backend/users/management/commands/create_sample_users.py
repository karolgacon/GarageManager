from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Profile

User = get_user_model()

class Command(BaseCommand):
    help = 'Tworzy przykładowych użytkowników do testowania systemu'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-if-exists',
            action='store_true',
            help='Pomiń tworzenie jeśli użytkownicy już istnieją',
        )

    def handle(self, *args, **options):
        skip_if_exists = options['skip_if_exists']

        # Sprawdź czy już istnieją użytkownicy
        if skip_if_exists and User.objects.exists():
            self.stdout.write(
                self.style.WARNING('Użytkownicy już istnieją. Pomijam tworzenie.')
            )
            return

        # Przykładowi użytkownicy
        users_data = [
            {
                'email': 'admin@garagemanager.pl',
                'username': 'admin',
                'first_name': 'Jan',
                'last_name': 'Administrator',
                'role': 'admin',
                'password': 'admin123',
                'phone': '+48123456789',
                'address': 'ul. Główna 1, 00-001 Warszawa',
            },
            {
                'email': 'mechanic1@garagemanager.pl',
                'username': 'mechanic1',
                'first_name': 'Andrzej',
                'last_name': 'Kowalski',
                'role': 'mechanic',
                'password': 'mechanic123',
                'phone': '+48234567890',
                'address': 'ul. Warsztatowa 15, 02-123 Warszawa',
                'specializations': ['toyota', 'volkswagen'],  # Specializes in Toyota and VW
            },
            {
                'email': 'mechanic2@garagemanager.pl',
                'username': 'mechanic2',
                'first_name': 'Piotr',
                'last_name': 'Nowak',
                'role': 'mechanic',
                'password': 'mechanic123',
                'phone': '+48345678901',
                'address': 'ul. Serwisowa 8, 03-456 Warszawa',
                'specializations': ['bmw', 'mercedes'],  # Specializes in BMW and Mercedes
            },
            {
                'email': 'client1@garagemanager.pl',
                'username': 'client1',
                'first_name': 'Anna',
                'last_name': 'Kowalczyk',
                'role': 'client',
                'password': 'client123',
                'phone': '+48456789012',
                'address': 'ul. Klietowa 22, 04-789 Warszawa',
            },
            {
                'email': 'client2@garagemanager.pl',
                'username': 'client2',
                'first_name': 'Marek',
                'last_name': 'Wiśniewski',
                'role': 'client',
                'password': 'client123',
                'phone': '+48567890123',
                'address': 'ul. Samochodowa 5, 05-012 Warszawa',
            },
            {
                'email': 'owner@garagemanager.pl',
                'username': 'owner',
                'first_name': 'Barbara',
                'last_name': 'Właściciel',
                'role': 'owner',
                'password': 'owner123',
                'phone': '+48678901234',
                'address': 'ul. Biznesowa 10, 06-345 Warszawa',
            },
        ]

        created_users = []

        for user_data in users_data:
            # Sprawdź czy użytkownik już istnieje
            if User.objects.filter(email=user_data['email']).exists():
                self.stdout.write(
                    self.style.WARNING(f'Użytkownik {user_data["email"]} już istnieje')
                )
                continue

            # Utwórz użytkownika
            user = User.objects.create_user(
                email=user_data['email'],
                username=user_data['username'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                role=user_data['role'],
                password=user_data['password'],
                is_staff=user_data['role'] in ['admin', 'owner'],
                is_superuser=user_data['role'] == 'admin',
            )

            # Utwórz profil
            specializations = user_data.get('specializations', [])
            Profile.objects.create(
                user=user,
                phone=user_data['phone'],
                address=user_data['address'],
                preferred_contact_method='email',
                specializations=specializations,
            )

            created_users.append(user)

        self.stdout.write(
            self.style.SUCCESS(
                f'Pomyślnie utworzono {len(created_users)} użytkowników'
            )
        )

        for user in created_users:
            self.stdout.write(f'  - {user.email} ({user.get_role_display()})')