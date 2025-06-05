

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('vehicles', '0001_initial'),
        ('workshops', '0002_remove_workshop_description_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Appointment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField()),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('confirmed', 'Confirmed'), ('in_progress', 'In progress'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='low', max_length=20)),
                ('estimated_completion_date', models.DateTimeField(blank=True, null=True)),
                ('booking_type', models.CharField(choices=[('standard', 'Standard'), ('urgent', 'Urgent')], default='standard', max_length=20)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to=settings.AUTH_USER_MODEL)),
                ('vehicle', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='vehicles.vehicle')),
                ('workshop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='appointments', to='workshops.workshop')),
            ],
        ),
        migrations.CreateModel(
            name='RepairJob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('duration', models.IntegerField(help_text='Time in minutes')),
                ('complexity_level', models.CharField(choices=[('simple', 'Simple'), ('moderate', 'Moderate'), ('complex', 'Complex')], default='simple', max_length=20)),
                ('warranty_period', models.IntegerField(default=3, help_text='Guranty time in months')),
                ('diagnostic_notes', models.TextField(blank=True, null=True)),
                ('appointment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repair_jobs', to='appointments.appointment')),
                ('mechanic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repair_jobs', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='CustomerFeedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rating', models.IntegerField(help_text='Overall rating 1-5')),
                ('review_text', models.TextField(blank=True, null=True)),
                ('feedback_date', models.DateTimeField(auto_now_add=True)),
                ('service_quality', models.IntegerField(help_text='Service quality rating 1-5')),
                ('punctuality_rating', models.IntegerField(help_text='Punctuality rating 1-5')),
                ('would_recommend', models.BooleanField(default=False)),
                ('response_from_workshop', models.TextField(blank=True, null=True)),
                ('response_date', models.DateTimeField(blank=True, null=True)),
                ('tags', models.CharField(blank=True, max_length=255, null=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feedbacks', to=settings.AUTH_USER_MODEL)),
                ('repair_job', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='feedback', to='appointments.repairjob')),
            ],
        ),
    ]
