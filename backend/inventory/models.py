from django.db import models
from users.models import User
from appointments.models import RepairJob

class Part(models.Model):
    CATEGORY_CHOICES = [
        ('engine', 'Engine'),
        ('electrical', 'Electrical'),
        ('brake', 'Brake'),
        ('suspension', 'Suspension'),
        ('body', 'Body'),
    ]

    name = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    minimum_stock_level = models.IntegerField(default=5)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    supplier = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.manufacturer})"

class StockEntry(models.Model):
    CHANGE_TYPES = [
        ('purchase', 'Purchase'),
        ('sale', 'Sale'),
        ('return', 'Return'),
        ('adjustment', 'Adjustment'),
    ]

    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name='stock_entries')
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPES)
    quantity_change = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.part.name} - {self.change_type}"

class RepairJobPart(models.Model):
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
        ('refurbished', 'Refurbished'),
    ]

    repair_job = models.ForeignKey(RepairJob, on_delete=models.CASCADE, related_name='parts_used')
    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name='repair_jobs')
    quantity = models.IntegerField(default=1)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='new')
    used_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.part.name} in repair {self.repair_job}"