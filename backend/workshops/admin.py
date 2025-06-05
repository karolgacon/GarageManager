from django.contrib import admin
from .models import Workshop, Service, WorkshopMechanic, Report

class WorkshopMechanicInline(admin.TabularInline):
    model = WorkshopMechanic
    extra = 1
    verbose_name = "Mechanik"
    verbose_name_plural = "Mechanicy"

class WorkshopReportInline(admin.TabularInline):
    model = Report
    extra = 0
    readonly_fields = ("type", "generated_at", "data")
    can_delete = False
    verbose_name = "Raport"
    verbose_name_plural = "Raporty"

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "owner", "specialization", "rating")
    search_fields = ("name", "location", "owner__username")
    list_filter = ("specialization", "rating")
    readonly_fields = ("rating",)
    inlines = [WorkshopMechanicInline, WorkshopReportInline]

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "workshop", "price", "category", "estimated_duration")
    search_fields = ("name", "workshop__name")
    list_filter = ("category", "workshop")

@admin.register(WorkshopMechanic)
class WorkshopMechanicAdmin(admin.ModelAdmin):
    list_display = ("mechanic", "workshop", "hired_date")
    search_fields = ("mechanic__username", "workshop__name")
    list_filter = ("workshop",)

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("workshop", "type", "generated_at")
    search_fields = ("workshop__name",)
    list_filter = ("type", "generated_at")
    readonly_fields = ("generated_at", "data")
