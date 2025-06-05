from django.db import models
from users.models import User
from workshops.models import Service, Workshop

class Vehicle(models.Model):
    BRAND_CHOICES = [
        ('toyota', 'Toyota'),
        ('ford', 'Ford'),
        ('volkswagen', 'Volkswagen'),
        ('bmw', 'BMW'),
        ('mercedes', 'Mercedes')
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'In Maintenance'),
    ]

    FUEL_TYPE_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('lpg', 'LPG'),
        ('cng', 'CNG'),
    ]

    TRANSMISSION_CHOICES = [
        ('manual', 'Manual'),
        ('automatic', 'Automatic'),
        ('semi-automatic', 'Semi-Automatic'),
    ]

    brand = models.CharField(max_length=50, choices=BRAND_CHOICES)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    registration_number = models.CharField(max_length=20, unique=True)
    vin = models.CharField(max_length=50, unique=True)

    color = models.CharField(max_length=50, null=True, blank=True)
    engine_type = models.CharField(max_length=50, null=True, blank=True)
    mileage = models.IntegerField(null=True, blank=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, null=True, blank=True)
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES, null=True, blank=True)

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    workshop = models.ForeignKey(Workshop, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    last_service_date = models.DateField(null=True, blank=True)
    next_service_due = models.DateField(null=True, blank=True)

    image_url = models.URLField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number})"

    @property
    def owner_id(self):
        return self.owner.id if self.owner else None

    @property
    def owner_name(self):
        return f"{self.owner.first_name} {self.owner.last_name}" if self.owner else None

    @property
    def workshop_id(self):
        return self.workshop.id if self.workshop else None

    @property
    def workshop_name(self):
        return self.workshop.name if self.workshop else None

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

class VehicleService(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    ]

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='service_records')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='vehicle_services')
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='vehicle_services')

    service_date = models.DateField()
    completion_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)

    mechanic_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.vehicle.registration_number} - {self.service.name} ({self.status})"

    @property
    def name(self):
        """Return service name for compatibility with frontend"""
        return self.service.name if self.service else "Unknown Service"

    @property
    def vehicle_details(self):
        """Return vehicle details for frontend display"""
        if self.vehicle:
            return {
                'make': self.vehicle.brand,
                'model': self.vehicle.model,
                'registration_number': self.vehicle.registration_number,
                'year': self.vehicle.year
            }
        return {}