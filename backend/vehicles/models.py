from django.db import models
from users.models import User

class Vehicle(models.Model):
    BRAND_CHOICES = [
        ('toyota', 'Toyota'),
        ('ford', 'Ford'),
        ('volkswagen', 'Volkswagen'),
        ('bmw', 'BMW'),
        ('mercedes', 'Mercedes')
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    brand = models.CharField(max_length=50, choices=BRAND_CHOICES)
    model = models.CharField(max_length=50)
    registration_number = models.CharField(max_length=20, unique=True)
    vin = models.CharField(max_length=50, unique=True)
    manufacture_year = models.IntegerField()
    last_maintenance_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number})"

class Diagnostics(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='diagnostics')
    diagnostic_date = models.DateTimeField(auto_now_add=True)
    diagnostic_notes = models.TextField()
    estimated_repair_cost = models.DecimalField(max_digits=10, decimal_places=2)
    severity_level = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='low'
    )
    diagnostic_result = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Diagnostic {self.vehicle.registration_number} - {self.diagnostic_date}"

class MaintenanceSchedule(models.Model):
    SERVICE_TYPES = [
        ('oil_change', 'Oil change'),
        ('brake_check', 'Brake check'),
        ('full_service', 'Full service'),
        ('tire_rotation', 'Tire rotation'),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='maintenance_schedules')
    service_type = models.CharField(max_length=50, choices=SERVICE_TYPES)
    recommended_date = models.DateField()
    last_performed_date = models.DateField(null=True, blank=True)
    next_due_date = models.DateField()
    mileage_interval = models.IntegerField(help_text="Interval in kilometers")

    def __str__(self):
        return f"Maintenance for {self.vehicle.registration_number} - {self.service_type}"