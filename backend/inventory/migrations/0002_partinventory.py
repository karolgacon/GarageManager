

import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
        ('workshops', '0002_remove_workshop_description_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='PartInventory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=0)),
                ('location', models.CharField(blank=True, help_text='Shelf/bin location within the workshop', max_length=100, null=True)),
                ('part', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inventories', to='inventory.part')),
                ('workshop', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='part_inventories', to='workshops.workshop')),
            ],
            options={
                'verbose_name_plural': 'Part inventories',
                'unique_together': {('part', 'workshop')},
            },
        ),
    ]
