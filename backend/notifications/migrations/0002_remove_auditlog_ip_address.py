

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='auditlog',
            name='ip_address',
        ),
    ]
