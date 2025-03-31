from django.contrib import admin
from .models import Appointment, RepairJob, CustomerFeedback

# ---------------------------- ADMIN FOR APPOINTMENTS ----------------------------
@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("client", "workshop", "vehicle", "date", "status", "priority", "estimated_completion_date", "booking_type")
    search_fields = ("client__username", "workshop__name", "vehicle__registration_number")
    list_filter = ("status", "priority", "booking_type", "date")

# ---------------------------- ADMIN FOR REPAIR JOBS ----------------------------
@admin.register(RepairJob)
class RepairJobAdmin(admin.ModelAdmin):
    list_display = ("appointment", "mechanic", "cost", "duration", "complexity_level", "warranty_period")
    search_fields = ("appointment__vehicle__registration_number", "mechanic__username")
    list_filter = ("complexity_level", "warranty_period")

# ---------------------------- ADMIN FOR CUSTOMER FEEDBACK ----------------------------
@admin.register(CustomerFeedback)
class CustomerFeedbackAdmin(admin.ModelAdmin):
    list_display = ("repair_job", "client", "rating", "feedback_date", "service_quality", "punctuality_rating", "would_recommend")
    search_fields = ("client__username", "repair_job__appointment__vehicle__registration_number")
    list_filter = ("rating", "service_quality", "punctuality_rating", "would_recommend")