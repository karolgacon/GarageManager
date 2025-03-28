from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Workshop(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    location = models.TextField()
    description = models.TextField()
    mechanics = models.ManyToManyField(User, related_name='workshops')


    def __str__(self):
        return self.name

class Service(models.Model):
    id = models.AutoField(primary_key=True)
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} - {self.price}$ ({self.workshop.name})"