from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Workshop(models.Model):
    SPECIALIZATION_CHOICES = [
        ('general', 'Serwis ogólny'),
        ('electric', 'Samochody elektryczne'),
        ('diesel', 'Silniki diesel'),
        ('bodywork', 'Blacharstwo'),
        ('luxury', 'Samochody luksusowe')
    ]
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_workshops',null=True, blank=True)
    working_hours = models.CharField(max_length=100, default="8:00-16:00")
    location = models.TextField()
    
    # Geolokalizacja
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Szerokość geograficzna"
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Długość geograficzna"
    )
    address_full = models.TextField(
        null=True,
        blank=True,
        help_text="Pełny adres strukturalny"
    )
    google_place_id = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Google Places API ID"
    )
    
    specialization = models.CharField(
        max_length=50,
        choices=SPECIALIZATION_CHOICES,
        default='general'
    )
    contact_email = models.EmailField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    def __str__(self):
        return self.name
    
    @property
    def has_location_data(self):
        """Sprawdź czy warsztat ma dane geolokalizacyjne"""
        return self.latitude is not None and self.longitude is not None
    
    def distance_to(self, lat, lon):
        """Oblicz odległość do podanej lokalizacji w kilometrach"""
        if not self.has_location_data:
            return None
        
        import math
        
        # Konwersja na radiany
        lat1, lon1 = math.radians(float(self.latitude)), math.radians(float(self.longitude))
        lat2, lon2 = math.radians(lat), math.radians(lon)
        
        # Wzór haversine
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Promień Ziemi w kilometrach
        r = 6371
        
        return c * r

class Service(models.Model):
    CATEGORY_CHOICES = [
        ('maintenance', 'Maintanance'),
        ('repair', 'Repair'),
        ('diagnostics', 'Diagnostics'),
        ('tuning', 'Tuning')
    ]
    id = models.AutoField(primary_key=True)
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_duration = models.IntegerField(help_text="Estimated duration in minutes", default=60)
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='maintenance'
    )

    def __str__(self):
        return f"{self.name} - {self.price}$ ({self.workshop.name})"

class WorkshopMechanic(models.Model):
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)
    mechanic = models.ForeignKey(User, on_delete=models.CASCADE)
    hired_date = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ['workshop', 'mechanic']
    
    def __str__(self):
        return f"{self.mechanic.get_full_name()} - {self.workshop.name}"

class MechanicAvailability(models.Model):
    """Zarządzanie dostępnością poszczególnych mechaników"""
    WEEKDAY_CHOICES = [
        (0, 'Poniedziałek'),
        (1, 'Wtorek'),
        (2, 'Środa'),
        (3, 'Czwartek'),
        (4, 'Piątek'),
        (5, 'Sobota'),
        (6, 'Niedziela'),
    ]
    
    workshop_mechanic = models.ForeignKey(WorkshopMechanic, on_delete=models.CASCADE, related_name='availability_schedule')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField(help_text="Godzina rozpoczęcia pracy")
    end_time = models.TimeField(help_text="Godzina zakończenia pracy")
    is_available = models.BooleanField(default=True, help_text="Czy mechanik jest dostępny tego dnia")
    
    class Meta:
        unique_together = ['workshop_mechanic', 'weekday']
        ordering = ['weekday', 'start_time']
    
    def __str__(self):
        return f"{self.workshop_mechanic.mechanic.first_name} {self.workshop_mechanic.mechanic.last_name} - {self.get_weekday_display()} {self.start_time}-{self.end_time}"
    
    def is_available_at_time(self, date, time):
        """Sprawdza czy mechanik jest dostępny w danym czasie"""
        if not self.is_available:
            return False
        
        if date.weekday() != self.weekday:
            return False
            
        return self.start_time <= time <= self.end_time

class MechanicBreak(models.Model):
    """Przerwy w dostępności mechaników (urlopy, święta, etc.)"""
    workshop_mechanic = models.ForeignKey(WorkshopMechanic, on_delete=models.CASCADE, related_name='breaks')
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True, help_text="Opcjonalna godzina początku przerwy")
    end_time = models.TimeField(null=True, blank=True, help_text="Opcjonalna godzina końca przerwy")
    reason = models.CharField(max_length=255, blank=True)
    is_recurring = models.BooleanField(default=False, help_text="Czy przerwa jest cykliczna")
    
    class Meta:
        ordering = ['start_date']
    
    def __str__(self):
        return f"{self.workshop_mechanic.mechanic.first_name} {self.workshop_mechanic.mechanic.last_name} - {self.start_date} do {self.end_date}"
    
    def overlaps_with_slot(self, date, time):
        """Sprawdza czy przerwa pokrywa się z danym slotem czasowym"""
        if not (self.start_date <= date <= self.end_date):
            return False
        
        if self.start_time and self.end_time:
            return self.start_time <= time <= self.end_time
        
        return True  # Całodniowa przerwa

class WorkshopAvailability(models.Model):
    """Zarządzanie dostępnością warsztatów"""
    WEEKDAY_CHOICES = [
        (0, 'Poniedziałek'),
        (1, 'Wtorek'),
        (2, 'Środa'),
        (3, 'Czwartek'),
        (4, 'Piątek'),
        (5, 'Sobota'),
        (6, 'Niedziela'),
    ]
    
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='availability_schedule')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    start_time = models.TimeField(help_text="Godzina otwarcia")
    end_time = models.TimeField(help_text="Godzina zamknięcia")
    is_available = models.BooleanField(default=True, help_text="Czy warsztat jest dostępny tego dnia")
    slot_duration = models.IntegerField(default=60, help_text="Długość pojedynczego slotu w minutach")
    
    class Meta:
        unique_together = ['workshop', 'weekday']
        ordering = ['weekday', 'start_time']
    
    def __str__(self):
        return f"{self.workshop.name} - {self.get_weekday_display()} {self.start_time}-{self.end_time}"
    
    def get_available_slots(self, date):
        """Zwraca dostępne sloty czasowe dla danej daty"""
        from datetime import datetime, time, timedelta
        
        if not self.is_available:
            return []
        
        slots = []
        current_time = datetime.combine(date, self.start_time)
        end_time = datetime.combine(date, self.end_time)
        
        while current_time + timedelta(minutes=self.slot_duration) <= end_time:
            slots.append(current_time.time())
            current_time += timedelta(minutes=self.slot_duration)
        
        return slots

class WorkshopBreak(models.Model):
    """Przerwy w dostępności warsztatów (urlopy, święta, etc.)"""
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='breaks')
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True, help_text="Opcjonalna godzina początku przerwy")
    end_time = models.TimeField(null=True, blank=True, help_text="Opcjonalna godzina końca przerwy")
    reason = models.CharField(max_length=255, blank=True)
    is_recurring = models.BooleanField(default=False, help_text="Czy przerwa jest cykliczna (np. święta)")
    
    class Meta:
        ordering = ['start_date']
    
    def __str__(self):
        return f"{self.workshop.name} - {self.start_date} do {self.end_date}"
    
    def overlaps_with_slot(self, date, time):
        """Sprawdza czy przerwa pokrywa się z danym slotem czasowym"""
        if not (self.start_date <= date <= self.end_date):
            return False
        
        if self.start_time and self.end_time:
            return self.start_time <= time <= self.end_time
        
        return True  # Całodniowa przerwa


class Report(models.Model):
    REPORT_TYPES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('annual', 'Annual')
    ]

    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='reports')
    type = models.CharField(max_length=50, choices=REPORT_TYPES)
    generated_at = models.DateTimeField(auto_now_add=True)
    data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.workshop.name} - {self.type} raport"