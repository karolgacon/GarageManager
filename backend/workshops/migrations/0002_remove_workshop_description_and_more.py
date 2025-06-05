

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('workshops', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workshop',
            name='description',
        ),
        migrations.RemoveField(
            model_name='workshop',
            name='mechanics',
        ),
        migrations.AddField(
            model_name='service',
            name='category',
            field=models.CharField(choices=[('maintenance', 'Maintanance'), ('repair', 'Repair'), ('diagnostics', 'Diagnostics'), ('tuning', 'Tuning')], default='maintenance', max_length=50),
        ),
        migrations.AddField(
            model_name='service',
            name='estimated_duration',
            field=models.IntegerField(default=60, help_text='Estimated duration in minutes'),
        ),
        migrations.AddField(
            model_name='workshop',
            name='contact_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='workshop',
            name='contact_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='workshop',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='owned_workshops', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='workshop',
            name='rating',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=3),
        ),
        migrations.AddField(
            model_name='workshop',
            name='specialization',
            field=models.CharField(choices=[('general', 'Serwis ogólny'), ('electric', 'Samochody elektryczne'), ('diesel', 'Silniki diesel'), ('bodywork', 'Blacharstwo'), ('luxury', 'Samochody luksusowe')], default='general', max_length=50),
        ),
        migrations.AddField(
            model_name='workshop',
            name='working_hours',
            field=models.CharField(default='8:00-16:00', max_length=100),
        ),
        migrations.CreateModel(
            name='Report',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly'), ('annual', 'Annual')], max_length=50)),
                ('generated_at', models.DateTimeField(auto_now_add=True)),
                ('data', models.JSONField(blank=True, null=True)),
                ('workshop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='workshops.workshop')),
            ],
        ),
        migrations.CreateModel(
            name='WorkshopMechanic',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hired_date', models.DateField(auto_now_add=True)),
                ('mechanic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('workshop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workshops.workshop')),
            ],
            options={
                'unique_together': {('workshop', 'mechanic')},
            },
        ),
    ]
