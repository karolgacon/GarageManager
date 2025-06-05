from django.contrib import admin
from .models import User

class MyUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_active']
    ordering = ['email']

admin.site.register(User, MyUserAdmin)
