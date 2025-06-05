from django.contrib import admin
from .models import Notification, AuditLog

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "message", "read_status", "created_at", "notification_type", "channel")
    search_fields = ("user__username", "notification_type", "channel")
    list_filter = ("read_status", "notification_type", "channel", "created_at")

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action_type", "table_name", "record_id", "timestamp")
    search_fields = ("user__username", "table_name", "action_type")
    list_filter = ("action_type", "timestamp")
