from django.contrib import admin
from .models import Invoice , Payment

# ---------------------------- ADMIN FOR INVOICES ----------------------------
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("client", "amount", "discount", "issue_date", "due_date", "status", "tax_rate")
    search_fields = ("client__username",)
    list_filter = ("status", "issue_date", "due_date")

# ---------------------------- ADMIN FOR PAYMENTS ----------------------------
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("invoice", "amount_paid", "payment_method", "payment_date", "transaction_id")
    search_fields = ("invoice__client__username", "transaction_id")
    list_filter = ("payment_method", "payment_date")