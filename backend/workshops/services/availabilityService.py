from datetime import datetime, date, time, timedelta
from typing import List, Dict, Optional
from ..models import Workshop, WorkshopAvailability, WorkshopBreak
from backend.services.baseService import BaseService


class AvailabilityService(BaseService):
    model = WorkshopAvailability

    @classmethod
    def get_workshop_availability(cls, workshop_id: int, target_date: date) -> Dict:
        """Pobierz dostępność warsztatu na dany dzień"""
        try:
            workshop = Workshop.objects.get(id=workshop_id)
            weekday = target_date.weekday()
            
            # Pobierz harmonogram dla tego dnia tygodnia
            try:
                availability = WorkshopAvailability.objects.get(
                    workshop=workshop,
                    weekday=weekday
                )
            except WorkshopAvailability.DoesNotExist:
                return {
                    'available': False,
                    'message': 'Warsztat nie jest dostępny w tym dniu tygodnia',
                    'slots': []
                }

            if not availability.is_available:
                return {
                    'available': False,
                    'message': 'Warsztat jest zamknięty w tym dniu',
                    'slots': []
                }

            # Sprawdź przerwy/urlopy
            breaks = WorkshopBreak.objects.filter(
                workshop=workshop,
                start_date__lte=target_date,
                end_date__gte=target_date
            )

            # Pobierz dostępne sloty
            available_slots = availability.get_available_slots(target_date)
            
            # Usuń sloty w czasie przerw
            filtered_slots = []
            for slot_time in available_slots:
                blocked = False
                for break_obj in breaks:
                    if break_obj.overlaps_with_slot(target_date, slot_time):
                        blocked = True
                        break
                if not blocked:
                    filtered_slots.append(slot_time)

            # Usuń już zajęte sloty
            booked_slots = cls._get_booked_slots(workshop_id, target_date)
            final_slots = [
                slot for slot in filtered_slots 
                if slot not in booked_slots
            ]

            return {
                'available': len(final_slots) > 0,
                'message': 'Dostępne terminy' if final_slots else 'Brak dostępnych terminów',
                'slots': [slot.strftime('%H:%M') for slot in final_slots],
                'working_hours': {
                    'start': availability.start_time.strftime('%H:%M'),
                    'end': availability.end_time.strftime('%H:%M'),
                    'slot_duration': availability.slot_duration
                }
            }

        except Workshop.DoesNotExist:
            return {
                'available': False,
                'message': 'Warsztat nie istnieje',
                'slots': []
            }

    @classmethod
    def _get_booked_slots(cls, workshop_id: int, target_date: date) -> List[time]:
        """Pobierz już zajęte sloty czasowe"""
        from appointments.models import Appointment
        
        start_datetime = datetime.combine(target_date, time.min)
        end_datetime = datetime.combine(target_date, time.max)
        
        appointments = Appointment.objects.filter(
            workshop_id=workshop_id,
            date__range=[start_datetime, end_datetime],
            status__in=['confirmed', 'in_progress', 'pending']
        )
        
        return [appointment.date.time() for appointment in appointments]

    @classmethod
    def get_available_dates(cls, workshop_id: int, start_date: date, end_date: date) -> List[str]:
        """Pobierz dostępne daty w okresie"""
        available_dates = []
        current_date = start_date
        
        while current_date <= end_date:
            availability = cls.get_workshop_availability(workshop_id, current_date)
            if availability['available']:
                available_dates.append(current_date.isoformat())
            current_date += timedelta(days=1)
        
        return available_dates

    @classmethod
    def create_default_availability(cls, workshop_id: int):
        """Utwórz domyślny harmonogram dostępności dla warsztatu"""
        workshop = Workshop.objects.get(id=workshop_id)
        
        # Standardowy harmonogram: Pon-Pt 8:00-17:00, Sob 8:00-15:00
        default_schedule = [
            (0, time(8, 0), time(17, 0)),  # Poniedziałek
            (1, time(8, 0), time(17, 0)),  # Wtorek
            (2, time(8, 0), time(17, 0)),  # Środa
            (3, time(8, 0), time(17, 0)),  # Czwartek
            (4, time(8, 0), time(17, 0)),  # Piątek
            (5, time(8, 0), time(15, 0)),  # Sobota
        ]
        
        for weekday, start_time, end_time in default_schedule:
            WorkshopAvailability.objects.get_or_create(
                workshop=workshop,
                weekday=weekday,
                defaults={
                    'start_time': start_time,
                    'end_time': end_time,
                    'is_available': True,
                    'slot_duration': 60
                }
            )

    @classmethod
    def check_slot_availability(cls, workshop_id: int, datetime_slot: datetime) -> bool:
        """Sprawdź czy konkretny slot czasowy jest dostępny"""
        target_date = datetime_slot.date()
        target_time = datetime_slot.time()
        
        availability = cls.get_workshop_availability(workshop_id, target_date)
        
        if not availability['available']:
            return False
        
        # Sprawdź czy czas mieści się w slotach
        time_str = target_time.strftime('%H:%M')
        return time_str in availability['slots']