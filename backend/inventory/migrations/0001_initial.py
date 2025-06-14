

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('appointments', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Part',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('manufacturer', models.CharField(max_length=100)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('stock_quantity', models.IntegerField(default=0)),
                ('minimum_stock_level', models.IntegerField(default=5)),
                ('category', models.CharField(choices=[('engine', 'Engine'), ('electrical', 'Electrical'), ('brake', 'Brake'), ('suspension', 'Suspension'), ('body', 'Body')], max_length=50)),
                ('supplier', models.CharField(blank=True, max_length=100, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='RepairJobPart',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField(default=1)),
                ('condition', models.CharField(choices=[('new', 'New'), ('used', 'Used'), ('refurbished', 'Refurbished')], default='new', max_length=20)),
                ('used_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('part', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='repair_jobs', to='inventory.part')),
                ('repair_job', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='parts_used', to='appointments.repairjob')),
            ],
        ),
        migrations.CreateModel(
            name='StockEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('change_type', models.CharField(choices=[('purchase', 'Purchase'), ('sale', 'Sale'), ('return', 'Return'), ('adjustment', 'Adjustment')], max_length=20)),
                ('quantity_change', models.IntegerField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField(blank=True, null=True)),
                ('part', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stock_entries', to='inventory.part')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
