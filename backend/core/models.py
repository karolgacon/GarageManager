from django.db import models

# Create your models here.

class Recipe(models.Model):
    """Represent a recipe object"""
    name = models.CharField(max_length=255)
    steps = models.TextField()

    def __str__(self):
        return self.name
