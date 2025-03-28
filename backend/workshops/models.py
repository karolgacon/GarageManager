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