

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
            name='Vehicle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('brand', models.CharField(choices=[('toyota', 'Toyota'), ('ford', 'Ford'), ('volkswagen', 'Volkswagen'), ('bmw', 'BMW'), ('mercedes', 'Mercedes')], max_length=50)),
                ('model', models.CharField(max_length=50)),
                ('registration_number', models.CharField(max_length=20, unique=True)),
                ('vin', models.CharField(max_length=50, unique=True)),
                ('manufacture_year', models.IntegerField()),
                ('last_maintenance_date', models.DateField(blank=True, null=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicles', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='MaintenanceSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('service_type', models.CharField(choices=[('oil_change', 'Oil change'), ('brake_check', 'Brake check'), ('full_service', 'Full service'), ('tire_rotation', 'Tire rotation')], max_length=50)),
                ('recommended_date', models.DateField()),
                ('last_performed_date', models.DateField(blank=True, null=True)),
                ('next_due_date', models.DateField()),
                ('mileage_interval', models.IntegerField(help_text='Interval in kilometers')),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='maintenance_schedules', to='vehicles.vehicle')),
            ],
        ),
        migrations.CreateModel(
            name='Diagnostics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('diagnostic_date', models.DateTimeField(auto_now_add=True)),
                ('diagnostic_notes', models.TextField()),
                ('estimated_repair_cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('severity_level', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], default='low', max_length=20)),
                ('diagnostic_result', models.JSONField(blank=True, null=True)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='diagnostics', to='vehicles.vehicle')),
            ],
        ),
    ]
