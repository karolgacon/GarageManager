from django.contrib.auth.base_user import BaseUserManager, AbstractBaseUser
from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission, PermissionsMixin


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('A user email is needed.')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)  # Hashowanie hasła
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_staff', True)

        return self.create_user(email, password, **extra_fields)


# Używamy domyślnego modelu User z Django
class User(AbstractBaseUser, PermissionsMixin):
    id = models.AutoField(primary_key=True)  # Automatyczne generowanie ID
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('owner', 'Owner'),
        ('mechanic', 'Mechanic'),
        ('client', 'Client'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('blocked', 'Blocked'),
        ('suspended', 'Suspended'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    is_staff = models.BooleanField(default=False)  # Konieczne do logowania do panelu admina
    is_active = models.BooleanField(default=True)  # Umożliwia blokowanie konta
    date_joined = models.DateTimeField(auto_now_add=True)  # Data utworzenia konta
    last_login = models.DateTimeField(null=True, blank=True)
    login_attempts = models.IntegerField(default=0)

    USERNAME_FIELD = 'email'
    objects = CustomUserManager()

    def __str__(self):
        return self.email

# Profil użytkownika przechowujący dodatkowe dane
class Profile(models.Model):
    CONTACT_CHOICES = [
        ('email', 'E-mail'),
        ('phone', 'Telefon'),
        ('sms', 'SMS')
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    address = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    preferred_contact_method = models.CharField(
        max_length=20,
        choices=CONTACT_CHOICES,
        default='email'
    )

    def __str__(self):
        return f"Profile of {self.user.username}"

class LoginHistory(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success login'),
        ('failed', 'Failed login'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history')
    login_time = models.DateTimeField(auto_now_add=True)
    device_info = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"Login history of {self.user.username}"

class LoyaltyPoints(models.Model):
    LEVEL_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='loyalty_points')
    total_points = models.IntegerField(default=0)
    membership_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='bronze')
    points_earned_this_year = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.membership_level} level"
