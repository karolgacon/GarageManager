from django.contrib import admin
from .models import Vehicle, Diagnostics, MaintenanceSchedule

# ---------------------------- ADMIN FOR VEHICLES ----------------------------
@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("client", "brand", "model", "registration_number", "vin", "manufacture_year", "last_maintenance_date")
    search_fields = ("client__username", "brand", "model", "registration_number", "vin")
    list_filter = ("brand", "manufacture_year")

# ---------------------------- ADMIN FOR DIAGNOSTICS ----------------------------
@admin.register(Diagnostics)
class DiagnosticsAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "diagnostic_date", "severity_level", "estimated_repair_cost")
    search_fields = ("vehicle__registration_number", "vehicle__vin")
    list_filter = ("severity_level", "diagnostic_date")
    readonly_fields = ("diagnostic_date",)

# ---------------------------- ADMIN FOR MAINTENANCE SCHEDULE ----------------------------
@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = ("vehicle", "service_type", "recommended_date", "last_performed_date", "next_due_date", "mileage_interval")
    search_fields = ("vehicle__registration_number", "vehicle__vin")
    list_filter = ("service_type", "recommended_date", "next_due_date")
