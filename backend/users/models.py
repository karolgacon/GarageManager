from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin


class CarWorkshop(models.Model):
    nip = models.CharField(blank=False, null=False)
    name = models.CharField(blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(blank=True)
    phone_number = models.CharField(blank=True)


class CustomUserManager(BaseUserManager):
    def create_user(self, email, username=None, password=None):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, username=username)
        user.set_password(password)  # Hasłowanie hasła
        user.save()
        return user

    def create_superuser(self, email, username=None, password=None):
        user = self.create_user(email, username, password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user


class User(AbstractBaseUser, PermissionsMixin):
    id = models.CharField(max_length=500, blank=True, unique=True, primary_key=True)
    email = models.EmailField(max_length=100, unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)  # Opcjonalny username
    car_workshop = models.ForeignKey(CarWorkshop, on_delete=models.CASCADE, null=True)

    ROLE_CHOICES = (
        ('admin', 'admin'),
        ('owner', 'owner'),
        ('mechanic', 'mechanic'),
        ('client', 'client'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')

    USERNAME_FIELD = 'email'  # Używamy email jako główny identyfikator
    REQUIRED_FIELDS = ['username']  # Dodajemy username do wymaganych pól w przypadku migracji
    objects = CustomUserManager()

    groups = models.ManyToManyField('auth.Group', related_name='user_set_custom', blank=True)
    user_permissions = models.ManyToManyField('auth.Permission', related_name='user_permissions_custom', blank=True)

    def __str__(self):
        return self.email
