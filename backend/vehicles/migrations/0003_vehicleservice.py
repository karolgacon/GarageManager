

import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0002_rename_last_maintenance_date_vehicle_last_service_date_and_more'),
        ('workshops', '0002_remove_workshop_description_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='VehicleService',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('service_date', models.DateField()),
                ('completion_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(choices=[('scheduled', 'Scheduled'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('canceled', 'Canceled')], default='scheduled', max_length=20)),
                ('cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('description', models.TextField(blank=True, null=True)),
                ('mechanic_notes', models.TextField(blank=True, null=True)),
                ('service', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicle_services', to='workshops.service')),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='service_records', to='vehicles.vehicle')),
                ('workshop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vehicle_services', to='workshops.workshop')),
            ],
        ),
    ]
