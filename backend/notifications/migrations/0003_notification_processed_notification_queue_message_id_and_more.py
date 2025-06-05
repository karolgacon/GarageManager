

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0002_remove_auditlog_ip_address'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='processed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='notification',
            name='queue_message_id',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='notification',
            name='channel',
            field=models.CharField(choices=[('email', 'E-mail'), ('sms', 'SMS'), ('push', 'Powiadomienie push'), ('queue', 'Kolejka')], default='email', max_length=20),
        ),
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(choices=[('appointment_reminder', 'Przypomnienie o wizycie'), ('repair_status', 'Status naprawy'), ('invoice', 'Faktura'), ('promotional', 'Promocyjna'), ('system', 'Systemowa'), ('service_reminder', 'Przypomnienie o serwisie')], max_length=50),
        ),
    ]
