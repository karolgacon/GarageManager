from django.contrib import admin
from .models import User  # Używasz modelu User zdefiniowanego w aplikacji users


class MyUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_active']  # Użyj dostępnych pól
    ordering = ['email']  # Zmieniamy na istniejące pole, np. 'email'


admin.site.register(User, MyUserAdmin)
