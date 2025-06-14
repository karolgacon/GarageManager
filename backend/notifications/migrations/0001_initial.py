

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action_type', models.CharField(choices=[('create', 'Utworzenie'), ('update', 'Aktualizacja'), ('delete', 'Usunięcie')], max_length=50)),
                ('table_name', models.CharField(max_length=50)),
                ('record_id', models.IntegerField()),
                ('old_value', models.JSONField(blank=True, null=True)),
                ('new_value', models.JSONField(blank=True, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('read_status', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('notification_type', models.CharField(choices=[('appointment_reminder', 'Przypomnienie o wizycie'), ('repair_status', 'Status naprawy'), ('invoice', 'Faktura'), ('promotional', 'Promocyjna'), ('system', 'Systemowa')], max_length=50)),
                ('channel', models.CharField(choices=[('email', 'E-mail'), ('sms', 'SMS'), ('push', 'Powiadomienie push')], default='email', max_length=20)),
                ('related_object_id', models.IntegerField(blank=True, null=True)),
                ('related_object_type', models.CharField(blank=True, max_length=50, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
