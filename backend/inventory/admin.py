from django.contrib import admin
from .models import Part, StockEntry, RepairJobPart

# ---------------------------- ADMIN FOR PARTS ----------------------------
@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ("name", "manufacturer", "price", "stock_quantity", "category", "supplier")
    search_fields = ("name", "manufacturer")
    list_filter = ("category", "supplier")

# ---------------------------- ADMIN FOR STOCK ENTRIES ----------------------------
@admin.register(StockEntry)
class StockEntryAdmin(admin.ModelAdmin):
    list_display = ("part", "change_type", "quantity_change", "timestamp", "user")
    search_fields = ("part__name", "user__username")
    list_filter = ("change_type", "timestamp")

# ---------------------------- ADMIN FOR REPAIR JOB PARTS ----------------------------
@admin.register(RepairJobPart)
class RepairJobPartAdmin(admin.ModelAdmin):
    list_display = ("repair_job", "part", "quantity", "condition", "used_price")
    search_fields = ("repair_job__appointment__vehicle__registration_number", "part__name")
    list_filter = ("condition",)
