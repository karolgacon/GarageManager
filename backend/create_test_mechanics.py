import os
import sys
import django
from datetime import datetime, time, timedelta
from django.utils import timezone

# Dodajemy backend do path
sys.path.append('/app')

# Ustawiamy Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User
from workshops.models import Workshop, WorkshopMechanic, MechanicAvailability
from django.contrib.auth.hashers import make_password

print("🔧 Tworzenie testowych mechaników...")

# 1. Tworzenie użytkowników mechaników
mechanics_data = [
    {
        'username': 'mechanic_jan',
        'email': 'jan.kowalski@garage.com',
        'first_name': 'Jan',
        'last_name': 'Kowalski',
        'specialization': 'Silniki'
    },
    {
        'username': 'mechanic_piotr',
        'email': 'piotr.nowak@garage.com', 
        'first_name': 'Piotr',
        'last_name': 'Nowak',
        'specialization': 'Elektronika'
    },
    {
        'username': 'mechanic_anna',
        'email': 'anna.wisniewska@garage.com',
        'first_name': 'Anna', 
        'last_name': 'Wiśniewska',
        'specialization': 'Hamulce'
    },
    {
        'username': 'mechanic_tomasz',
        'email': 'tomasz.kaczmarek@garage.com',
        'first_name': 'Tomasz',
        'last_name': 'Kaczmarek', 
        'specialization': 'Karoseria'
    }
]

created_mechanics = []

for mech_data in mechanics_data:
    try:
        # Sprawdzamy czy użytkownik już istnieje
        if User.objects.filter(username=mech_data['username']).exists():
            user = User.objects.get(username=mech_data['username'])
            print(f"✓ Mechanik {mech_data['first_name']} {mech_data['last_name']} już istnieje")
        else:
            # Tworzymy nowego użytkownika
            user = User.objects.create(
                username=mech_data['username'],
                email=mech_data['email'],
                first_name=mech_data['first_name'],
                last_name=mech_data['last_name'],
                password=make_password('mechanic123'),
                role='mechanic',
                is_active=True
            )
            print(f"✅ Utworzono mechanika: {user.first_name} {user.last_name}")
        
        created_mechanics.append({'user': user, 'specialization': mech_data['specialization']})
        
    except Exception as e:
        print(f"❌ Błąd przy tworzeniu mechanika {mech_data['first_name']}: {e}")

print(f"\n🏭 Przypisywanie mechaników do warsztatów...")

# 2. Pobieramy warsztaty i przypisujemy mechaników
workshops = Workshop.objects.all()
print(f"Znaleziono {workshops.count()} warsztatów")

if workshops.exists():
    for i, workshop in enumerate(workshops):
        # Przypisujemy 2-3 mechaników do każdego warsztatu
        mechanics_to_assign = created_mechanics[i:i+3] if i < len(created_mechanics) else created_mechanics[:2]
        
        for mech_info in mechanics_to_assign:
            try:
                # Sprawdzamy czy przypisanie już istnieje
                if WorkshopMechanic.objects.filter(
                    workshop=workshop,
                    mechanic=mech_info['user']
                ).exists():
                    print(f"✓ {mech_info['user'].first_name} już przypisany do {workshop.name}")
                else:
                    workshop_mechanic = WorkshopMechanic.objects.create(
                        workshop=workshop,
                        mechanic=mech_info['user']
                    )
                    print(f"✅ Przypisano {mech_info['user'].first_name} do warsztatu {workshop.name}")
                    
            except Exception as e:
                print(f"❌ Błąd przy przypisywaniu mechanika: {e}")

print(f"\n📅 Tworzenie harmonogramów dostępności...")

# 3. Tworzenie harmonogramów dostępności (dni tygodnia)
for workshop_mechanic in WorkshopMechanic.objects.all():
    # Tworzymy harmonogram dla każdego dnia roboczego (0-5 = pon-sob)
    for weekday in range(6):  # Poniedziałek-Sobota
        try:
            # Sprawdzamy czy dostępność już istnieje
            if MechanicAvailability.objects.filter(
                workshop_mechanic=workshop_mechanic,
                weekday=weekday
            ).exists():
                continue
                
            # Różne harmonogramy dla różnych dni
            if weekday < 5:  # Poniedziałek-Piątek
                start_time = time(8, 0)  # 8:00
                end_time = time(16, 0)   # 16:00
            else:  # Sobota
                start_time = time(9, 0)  # 9:00
                end_time = time(13, 0)   # 13:00
            
            availability = MechanicAvailability.objects.create(
                workshop_mechanic=workshop_mechanic,
                weekday=weekday,
                start_time=start_time,
                end_time=end_time,
                is_available=True
            )
            
        except Exception as e:
            print(f"❌ Błąd przy tworzeniu dostępności dla {workshop_mechanic.mechanic.first_name} w {weekday}: {e}")

print(f"\n📊 Podsumowanie:")
print(f"👥 Mechanicy: {User.objects.filter(role='mechanic').count()}")
print(f"🔗 Przypisania do warsztatów: {WorkshopMechanic.objects.count()}")
print(f"📅 Wpisy dostępności: {MechanicAvailability.objects.count()}")

print(f"\n🎯 Testowe mechaników utworzeni pomyślnie!")
print(f"\n📝 Dane logowania dla mechaników:")
for mech in created_mechanics:
    print(f"  • {mech['user'].first_name} {mech['user'].last_name}")
    print(f"    Login: {mech['user'].username}")
    print(f"    Email: {mech['user'].email}")
    print(f"    Hasło: mechanic123")
    print(f"    Specjalizacja: {mech['specialization']}")
    print()