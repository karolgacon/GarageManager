

import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0001_initial'),
        ('workshops', '0002_remove_workshop_description_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='vehicle',
            old_name='last_maintenance_date',
            new_name='last_service_date',
        ),
        migrations.RenameField(
            model_name='vehicle',
            old_name='client',
            new_name='owner',
        ),
        migrations.RenameField(
            model_name='vehicle',
            old_name='manufacture_year',
            new_name='year',
        ),
        migrations.AddField(
            model_name='vehicle',
            name='color',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='engine_type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='fuel_type',
            field=models.CharField(blank=True, choices=[('petrol', 'Petrol'), ('diesel', 'Diesel'), ('electric', 'Electric'), ('hybrid', 'Hybrid'), ('lpg', 'LPG'), ('cng', 'CNG')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='image_url',
            field=models.URLField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='mileage',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='next_service_due',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='status',
            field=models.CharField(choices=[('active', 'Active'), ('inactive', 'Inactive'), ('maintenance', 'In Maintenance')], default='active', max_length=20),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='transmission',
            field=models.CharField(blank=True, choices=[('manual', 'Manual'), ('automatic', 'Automatic'), ('semi-automatic', 'Semi-Automatic')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='workshop',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='vehicles', to='workshops.workshop'),
        ),
    ]
