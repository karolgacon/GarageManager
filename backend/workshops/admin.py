from django.contrib import admin
from .models import Workshop, Service, WorkshopMechanic, Report

# ---------------------------- INLINE MECHANICS ----------------------------
class WorkshopMechanicInline(admin.TabularInline):
    model = WorkshopMechanic
    extra = 1  # Można dodać nowego mechanika bezpośrednio w edycji warsztatu
    verbose_name = "Mechanik"
    verbose_name_plural = "Mechanicy"

# ---------------------------- INLINE REPORTS ----------------------------
class WorkshopReportInline(admin.TabularInline):
    model = Report
    extra = 0  # Nie dodajemy nowych raportów ręcznie
    readonly_fields = ("type", "generated_at", "data")  # Raporty są generowane automatycznie
    can_delete = False
    verbose_name = "Raport"
    verbose_name_plural = "Raporty"

# ---------------------------- ADMIN FOR WORKSHOPS ----------------------------
@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ("name", "location", "owner", "specialization", "rating")
    search_fields = ("name", "location", "owner__username")
    list_filter = ("specialization", "rating")
    readonly_fields = ("rating",)  # Ocena jest aktualizowana automatycznie
    inlines = [WorkshopMechanicInline, WorkshopReportInline]

# ---------------------------- ADMIN FOR SERVICES ----------------------------
@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "workshop", "price", "category", "estimated_duration")
    search_fields = ("name", "workshop__name")
    list_filter = ("category", "workshop")

# ---------------------------- ADMIN FOR MECHANICS ----------------------------
@admin.register(WorkshopMechanic)
class WorkshopMechanicAdmin(admin.ModelAdmin):
    list_display = ("mechanic", "workshop", "hired_date")
    search_fields = ("mechanic__username", "workshop__name")
    list_filter = ("workshop",)

# ---------------------------- ADMIN FOR REPORTS ----------------------------
@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("workshop", "type", "generated_at")
    search_fields = ("workshop__name",)
    list_filter = ("type", "generated_at")
    readonly_fields = ("generated_at", "data")
