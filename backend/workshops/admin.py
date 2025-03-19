from django.contrib import admin
from .models import Workshop, Service

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ("name", "location")
    search_fields = ("name", "location")
    filter_horizontal = ("mechanics",)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "workshop", "price")
    search_fields = ("name",)
