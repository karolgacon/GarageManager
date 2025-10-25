# 🔧 POPRAWKA POWIĄZAŃ: POJAZD-WARSZTAT-MECHANIK

**Problem:** Pojazd jest przypisany na stałe do warsztatu, co uniemożliwia wybór różnych warsztatów  
**Rozwiązanie:** Usunąć pole `workshop` z Vehicle, powiązania przez Appointment

## 📊 AKTUALNY STAN (BŁĘDNY)

```
Vehicle ──────┐
│             │
├─ owner ─────┼─ User (client)
├─ workshop ──┼─ Workshop  ❌ ZŁE! Na stałe przypisany
│             │
└─ Appointment ─┐
    │           │
    ├─ vehicle ─┤
    ├─ client ──┼─ User
    ├─ workshop ─┼─ Workshop
    │           │
    └─ RepairJob ─┐
        │         │
        ├─ appointment
        └─ mechanic ─ User (mechanic)
```

## 🎯 POPRAWNY STAN (DOCELOWY)

```
Vehicle ──────┐
│             │
├─ owner ─────┼─ User (client)
│ (bez workshop)
│             │
└─ Appointment ─┐
    │           │
    ├─ vehicle ─┤
    ├─ client ──┼─ User
    ├─ workshop ─┼─ Workshop ✅ WYBIERANY PER WIZYTA
    │           │
    └─ RepairJob ─┐
        │         │
        ├─ appointment
        └─ mechanic ─ User (mechanic) ✅ PRZYPISANY DO NAPRAWY
```

## 🔄 FLOW BIZNESOWY

### 1. **Klient ma pojazd**

```python
Vehicle(owner=client)  # Tylko właściciel, bez warsztatu
```

### 2. **Klient wybiera warsztat dla konkretnej naprawy**

```python
Appointment(
    client=client,
    vehicle=vehicle,
    workshop=chosen_workshop,  # Dowolny warsztat!
    date=appointment_date
)
```

### 3. **Warsztat przypisuje mechanika do naprawy**

```python
RepairJob(
    appointment=appointment,
    mechanic=chosen_mechanic,  # Z tego warsztatu
    description="Wymiana oleju",
    cost=200.00
)
```

### 4. **Historia napraw w różnych warsztatach**

```python
# Pojazd może mieć naprawy w różnych warsztatach:
vehicle.appointments.all()
# -> Appointment(workshop=WarsztatA, date=2025-01-01)
# -> Appointment(workshop=WarsztatB, date=2025-02-01)
# -> Appointment(workshop=WarsztatA, date=2025-03-01)
```

## 📝 KONKRETNE ZMIANY DO WPROWADZENIA

### 1. **Migracja bazy danych**

```python
# vehicles/migrations/0002_remove_workshop_field.py
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('vehicles', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='vehicle',
            name='workshop',
        ),
    ]
```

### 2. **Aktualizacja modelu Vehicle**

```python
# vehicles/models.py
class Vehicle(models.Model):
    # ... existing fields
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    # workshop = USUWAMY TO POLE!
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Dodajemy property dla aktualnego warsztatu (ostatnia wizyta)
    @property
    def current_workshop(self):
        """Warsztat z ostatniej/aktualnej wizyty"""
        last_appointment = self.appointments.filter(
            status__in=['confirmed', 'in_progress']
        ).order_by('-date').first()
        return last_appointment.workshop if last_appointment else None

    @property
    def workshop_history(self):
        """Historia warsztatów gdzie był pojazd"""
        return Workshop.objects.filter(
            appointments__vehicle=self
        ).distinct().order_by('-appointments__date')
```

### 3. **Rozszerzenie modelu Appointment**

```python
# appointments/models.py - DODAĆ POLE
class Appointment(models.Model):
    # ... existing fields
    assigned_mechanic = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_appointments',
        help_text="Mechanik przypisany do tej wizyty"
    )
```

### 4. **API dla wyboru warsztatu**

```python
# appointments/views.py
@api_view(['GET'])
def available_workshops(request):
    """Znajdź dostępne warsztaty dla danej daty"""
    date = request.GET.get('date')
    vehicle_id = request.GET.get('vehicle_id')

    # Logika sprawdzania dostępności warsztatów
    available_workshops = Workshop.objects.filter(
        # Logika dostępności
    )

    return Response(WorkshopSerializer(available_workshops, many=True).data)

@api_view(['POST'])
def book_appointment(request):
    """Rezerwuj wizytę w wybranym warsztacie"""
    data = request.data

    appointment = Appointment.objects.create(
        client=request.user,
        vehicle_id=data['vehicle_id'],
        workshop_id=data['workshop_id'],  # Klient wybiera!
        date=data['date']
    )

    return Response(AppointmentSerializer(appointment).data)
```

### 5. **Frontend - wybór warsztatu**

```typescript
// components/Booking/WorkshopSelector.tsx
interface WorkshopSelectorProps {
	vehicleId: string;
	selectedDate: Date;
	onWorkshopSelect: (workshop: Workshop) => void;
}

const WorkshopSelector: React.FC<WorkshopSelectorProps> = ({
	vehicleId,
	selectedDate,
	onWorkshopSelect,
}) => {
	const [availableWorkshops, setAvailableWorkshops] = useState<Workshop[]>([]);

	useEffect(() => {
		// Pobierz dostępne warsztaty dla daty
		fetchAvailableWorkshops(selectedDate, vehicleId).then(
			setAvailableWorkshops
		);
	}, [selectedDate, vehicleId]);

	return (
		<Box>
			<Typography variant="h6">Wybierz warsztat:</Typography>
			{availableWorkshops.map((workshop) => (
				<WorkshopCard
					key={workshop.id}
					workshop={workshop}
					onSelect={() => onWorkshopSelect(workshop)}
					showAvailability={true}
				/>
			))}
		</Box>
	);
};
```

## ✅ KORZYŚCI Z POPRAWKI

### 1. **Elastyczność dla klienta**

- Może wybierać warsztat per wizyta
- Może porównywać ceny/opinie
- Może korzystać z promocji różnych warsztatów

### 2. **Konkurencja między warsztatami**

- Warsztaty muszą konkurować o klientów
- Lepsze ceny i jakość usług
- System opinii ma sens

### 3. **Czysta architektura**

- Vehicle = tylko dane pojazdu + właściciel
- Appointment = konkretna wizyta w konkretnym warsztacie
- RepairJob = konkretna naprawa przez konkretnego mechanika

### 4. **Historia napraw**

```python
# Klient może zobaczyć historię napraw w różnych warsztatach
def get_vehicle_service_history(vehicle):
    return RepairJob.objects.filter(
        appointment__vehicle=vehicle
    ).select_related(
        'appointment__workshop',
        'mechanic'
    ).order_by('-appointment__date')
```

## 🚨 PRIORYTET: WYSOKI

Ta poprawka powinna być w **Phase 0** (poprawki krytyczne), ponieważ:

1. **Zmienia fundamentalną logikę biznesową**
2. **Wpływa na wszystkie funkcjonalności**
3. **Trudniejsza do zmiany później**
4. **Blokuje proper booking system**

Czy chcesz, żebym dodał tę poprawkę do planu poprawek w `02-fixes-plan.md`?
