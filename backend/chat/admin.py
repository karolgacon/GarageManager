from django.contrib import admin
from .models import Conversation, Message, ConversationParticipant

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'client', 'mechanic', 'workshop', 'subject', 'status', 'priority', 'created_at']
    list_filter = ['status', 'priority', 'workshop', 'created_at']
    search_fields = ['subject', 'client__username', 'client__email', 'mechanic__username', 'mechanic__email']
    readonly_fields = ['uuid', 'created_at', 'last_message_at']
    
    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('uuid', 'subject', 'status', 'priority')
        }),
        ('Uczestnicy', {
            'fields': ('client', 'mechanic', 'workshop')
        }),
        ('Powiązania', {
            'fields': ('appointment',)
        }),
        ('Znaczniki czasowe', {
            'fields': ('created_at', 'last_message_at', 'closed_at')
        }),
    )

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['content', 'sender__username', 'sender__email']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Wiadomość', {
            'fields': ('conversation', 'sender', 'content', 'message_type')
        }),
        ('Załączniki', {
            'fields': ('attachment',)
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Metadane', {
            'fields': ('quote_data', 'created_at')
        }),
    )

@admin.register(ConversationParticipant)
class ConversationParticipantAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'user', 'joined_at', 'last_seen_at', 'is_typing']
    list_filter = ['joined_at', 'is_typing']
    search_fields = ['user__username', 'user__email', 'conversation__subject']
    readonly_fields = ['joined_at']
