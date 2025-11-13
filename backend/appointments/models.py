from django.db import models
from users.models import User
from vehicles.models import Vehicle
from workshops.models import Workshop
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Zaplanowane'),  # Umówione/oczekujące
        ('in_progress', 'W trakcie'), 
        ('completed', 'Skończone')
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ]

    BOOKING_TYPES = [
        ('standard', 'Standard'),
        ('urgent', 'Urgent'),
    ]

    APPOINTMENT_TYPES = [
        ('service', 'Serwis'),
        ('inspection', 'Przegląd'),
        ('diagnostic', 'Diagnostyka'),
        ('repair', 'Naprawa'),
        ('maintenance', 'Konserwacja'),
        ('other', 'Inne'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='appointments')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='appointments')
    assigned_mechanic = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_appointments',
        help_text="Mechanik przypisany do tej wizyty"
    )
    date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='low')
    estimated_completion_date = models.DateTimeField(null=True, blank=True)
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPES, default='standard')
    
    # Nowe pola dla wieloetapowego procesu rezerwacji
    appointment_type = models.CharField(
        max_length=20, 
        choices=APPOINTMENT_TYPES, 
        default='service',
        help_text="Typ wizyty (serwis, przegląd, etc.)"
    )
    service_description = models.TextField(
        null=True, 
        blank=True,
        help_text="Szczegółowy opis problemu lub wymaganej usługi"
    )
    duration_estimate = models.IntegerField(
        null=True, 
        blank=True,
        help_text="Szacowany czas trwania w minutach"
    )

    def __str__(self):
        return f"Wizyta {self.client.username} w {self.workshop.name}"

    def clean(self):
        if self.status not in dict(self.STATUS_CHOICES):
            raise ValidationError(f"Invalid status: {self.status}")
        if self.priority not in dict(self.PRIORITY_CHOICES):
            raise ValidationError(f"Invalid priority: {self.priority}")
        if self.booking_type not in dict(self.BOOKING_TYPES):
            raise ValidationError(f"Invalid booking type: {self.booking_type}")
        if self.appointment_type not in dict(self.APPOINTMENT_TYPES):
            raise ValidationError(f"Invalid appointment type: {self.appointment_type}")

    def save(self, *args, **kwargs):
        self.clean()
        # Automatycznie ustaw status na podstawie daty
        self.update_status_based_on_date()
        super().save(*args, **kwargs)
    
    def update_status_based_on_date(self):
        """
        Automatycznie aktualizuje status na podstawie daty i czasu
        """
        now = timezone.now()
        appointment_time = self.date
        
        # Szacowany czas zakończenia (domyślnie 2 godziny)
        estimated_end = appointment_time + timedelta(
            minutes=self.duration_estimate if self.duration_estimate else 120
        )
        
        # Jeśli appointment już się skończył -> completed
        if now > estimated_end and self.status != 'completed':
            self.status = 'completed'
        # Jeśli appointment trwa w tym momencie -> in_progress  
        elif appointment_time <= now <= estimated_end and self.status == 'scheduled':
            self.status = 'in_progress'
    
    @classmethod
    def update_all_statuses(cls):
        """
        Aktualizuje statusy wszystkich appointments na podstawie daty
        """
        for appointment in cls.objects.exclude(status='completed'):
            old_status = appointment.status
            appointment.update_status_based_on_date()
            if old_status != appointment.status:
                appointment.save()
    
    @property
    def estimated_end_time(self):
        """
        Zwraca szacowany czas zakończenia wizyty
        """
        duration = self.duration_estimate if self.duration_estimate else 120
        return self.date + timedelta(minutes=duration)

class RepairJob(models.Model):
    COMPLEXITY_CHOICES = [
        ('simple', 'Simple'),
        ('moderate', 'Moderate'),
        ('complex', 'Complex'),
    ]

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='repair_jobs')
    mechanic = models.ForeignKey(User, on_delete=models.CASCADE, related_name='repair_jobs')
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Time in minutes")
    complexity_level = models.CharField(
        max_length=20,
        choices=COMPLEXITY_CHOICES,
        default='simple'
    )
    warranty_period = models.IntegerField(help_text="Guranty time in months", default=3)
    diagnostic_notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Repair {self.appointment.vehicle} - {self.mechanic.username}"

class CustomerFeedback(models.Model):
    repair_job = models.OneToOneField(RepairJob, on_delete=models.CASCADE, related_name='feedback')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.IntegerField(help_text="Overall rating 1-5")
    review_text = models.TextField(null=True, blank=True)
    feedback_date = models.DateTimeField(auto_now_add=True)
    service_quality = models.IntegerField(help_text="Service quality rating 1-5")
    punctuality_rating = models.IntegerField(help_text="Punctuality rating 1-5")
    would_recommend = models.BooleanField(default=False)
    response_from_workshop = models.TextField(null=True, blank=True)
    response_date = models.DateTimeField(null=True, blank=True)
    tags = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Opinion {self.client.username} - {self.rating}/5"