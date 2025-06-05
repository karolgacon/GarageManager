

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='preferred_contact_method',
            field=models.CharField(choices=[('email', 'E-mail'), ('phone', 'Telefon'), ('sms', 'SMS')], default='email', max_length=20),
        ),
        migrations.AddField(
            model_name='user',
            name='login_attempts',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='user',
            name='status',
            field=models.CharField(choices=[('active', 'Active'), ('blocked', 'Blocked'), ('suspended', 'Suspended')], default='active', max_length=20),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_login',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.CreateModel(
            name='LoginHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('login_time', models.DateTimeField(auto_now_add=True)),
                ('device_info', models.CharField(blank=True, max_length=255, null=True)),
                ('status', models.CharField(choices=[('success', 'Success login'), ('failed', 'Failed login')], max_length=20)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='login_history', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='LoyaltyPoints',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_points', models.IntegerField(default=0)),
                ('membership_level', models.CharField(choices=[('bronze', 'Bronze'), ('silver', 'Silver'), ('gold', 'Gold'), ('platinum', 'Platinum')], default='bronze', max_length=20)),
                ('points_earned_this_year', models.IntegerField(default=0)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='loyalty_points', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
