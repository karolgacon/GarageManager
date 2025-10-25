from django.contrib import admin
from .models import Part, StockEntry, RepairJobPart, Supplier

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("name", "contact_person", "email", "phone", "city", "rating", "is_active")
    search_fields = ("name", "contact_person", "email")
    list_filter = ("city", "country", "is_active", "rating")
    fieldsets = (
        ("Podstawowe informacje", {
            "fields": ("name", "contact_person", "email", "phone")
        }),
        ("Adres", {
            "fields": ("address", "city", "postal_code", "country")
        }),
        ("Biznesowe", {
            "fields": ("website", "tax_id", "rating")
        }),
        ("Logistyka", {
            "fields": ("delivery_time_days", "minimum_order_value", "payment_terms")
        }),
        ("Status", {
            "fields": ("is_active",)
        }),
    )

@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ("name", "manufacturer", "price", "stock_quantity", "category", "supplier")
    search_fields = ("name", "manufacturer")
    list_filter = ("category", "supplier")

@admin.register(StockEntry)
class StockEntryAdmin(admin.ModelAdmin):
    list_display = ("part", "change_type", "quantity_change", "timestamp", "user")
    search_fields = ("part__name", "user__username")
    list_filter = ("change_type", "timestamp")

@admin.register(RepairJobPart)
class RepairJobPartAdmin(admin.ModelAdmin):
    list_display = ("repair_job", "part", "quantity", "condition", "used_price")
    search_fields = ("repair_job__appointment__vehicle__registration_number", "part__name")
    list_filter = ("condition",)
