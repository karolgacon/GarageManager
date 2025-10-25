from django.db import models
from users.models import User
from appointments.models import RepairJob

class Supplier(models.Model):
    """Dostawcy części samochodowych"""

    # Podstawowe dane
    name = models.CharField(max_length=100, unique=True)
    contact_person = models.CharField(max_length=100, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)

    # Adres
    address = models.TextField()
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="Polska")

    # Biznesowe
    website = models.URLField(null=True, blank=True)
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    # Logistyka
    delivery_time_days = models.IntegerField(default=7)
    minimum_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_terms = models.CharField(max_length=100, default="30 dni")

    # Status
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

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
    supplier = models.ForeignKey(
        Supplier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='parts'
    )

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

class PartInventory(models.Model):
    part = models.ForeignKey('Part', on_delete=models.CASCADE, related_name='inventories')
    workshop = models.ForeignKey('workshops.Workshop', on_delete=models.CASCADE, related_name='part_inventories')
    quantity = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=100, blank=True, null=True, help_text="Shelf/bin location within the workshop")

    class Meta:
        unique_together = ('part', 'workshop')
        verbose_name_plural = "Part inventories"

    def __str__(self):
        return f"{self.part.name} at {self.workshop.name}: {self.quantity} units"

class StockAlert(models.Model):
    """Alerty o niskim stanie magazynowym"""

    ALERT_TYPES = [
        ('low_stock', 'Niski stan'),
        ('out_of_stock', 'Brak na stanie'),
        ('reorder_point', 'Punkt uzupełnienia')
    ]

    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name='stock_alerts')
    workshop = models.ForeignKey('workshops.Workshop', on_delete=models.CASCADE, related_name='stock_alerts')
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)

    class Meta:
        unique_together = ('part', 'workshop', 'alert_type')

    def __str__(self):
        return f"{self.alert_type} alert for {self.part.name} at {self.workshop.name}"

    def resolve(self):
        """Oznacz alert jako rozwiązany"""
        from django.utils import timezone
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.save(update_fields=['is_resolved', 'resolved_at'])