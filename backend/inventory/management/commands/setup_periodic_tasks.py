from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json

class Command(BaseCommand):
    help = 'Setup periodic tasks for inventory management'

    def handle(self, *args, **options):
        # Stwórz harmonogram co godzinę
        schedule, created = CrontabSchedule.objects.get_or_create(
            minute=0,  # o pełnej godzinie
            hour='*',  # co godzinę
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
        )

        # Sprawdzanie stanów magazynowych co godzinę
        task, created = PeriodicTask.objects.get_or_create(
            crontab=schedule,
            name='Check Stock Levels',
            task='inventory.tasks.check_stock_levels',
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Successfully created periodic task: Check Stock Levels')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Periodic task "Check Stock Levels" already exists')
            )

        # Dodaj task do automatycznego uzupełniania stanów co 6 godzin
        schedule_6h, created = CrontabSchedule.objects.get_or_create(
            minute=0,
            hour='0,6,12,18',  # 4 razy dziennie
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
        )

        task_reorder, created = PeriodicTask.objects.get_or_create(
            crontab=schedule_6h,
            name='Auto Reorder Parts',
            task='inventory.tasks.auto_reorder_parts',
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Successfully created periodic task: Auto Reorder Parts')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Periodic task "Auto Reorder Parts" already exists')
            )

        self.stdout.write(
            self.style.SUCCESS('Periodic tasks setup completed!')
        )