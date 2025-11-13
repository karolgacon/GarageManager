from datetime import datetime, timedelta, time
from django.utils import timezone
from workshops.models import Workshop, WorkshopMechanic, MechanicAvailability, MechanicBreak
from appointments.models import Appointment
from users.models import User

class MechanicAvailabilityService:
    """Serwis do zarządzania dostępnością mechaników"""
    
    @staticmethod
    def get_workshop_mechanics(workshop_id):
        """Zwraca wszystkich mechaników w warsztacie"""
        return WorkshopMechanic.objects.filter(
            workshop_id=workshop_id,
            mechanic__role='mechanic',
            mechanic__is_active=True
        ).select_related('mechanic')
    
    @staticmethod
    def get_available_mechanics(workshop_id, date, time_slot, duration_minutes=60):
        """
        Zwraca listę dostępnych mechaników w danym czasie
        """
        workshop_mechanics = MechanicAvailabilityService.get_workshop_mechanics(workshop_id)
        available_mechanics = []
        
        appointment_time = datetime.combine(date, time_slot)
        appointment_end = appointment_time + timedelta(minutes=duration_minutes)
        
        for workshop_mechanic in workshop_mechanics:
            if MechanicAvailabilityService.is_mechanic_available(
                workshop_mechanic, 
                date, 
                time_slot, 
                duration_minutes
            ):
                available_mechanics.append(workshop_mechanic.mechanic)
        
        return available_mechanics
    
    @staticmethod
    def is_mechanic_available(workshop_mechanic, date, time_slot, duration_minutes=60):
        """
        Sprawdza czy mechanik jest dostępny w danym czasie
        """
        appointment_time = datetime.combine(date, time_slot)
        # Make appointment_time timezone-aware to match database timestamps
        if timezone.is_naive(appointment_time):
            appointment_time = timezone.make_aware(appointment_time)
        appointment_end = appointment_time + timedelta(minutes=duration_minutes)
        
        # Sprawdź podstawową dostępność (harmonogram pracy)
        weekday = date.weekday()
        try:
            availability = MechanicAvailability.objects.get(
                workshop_mechanic=workshop_mechanic,
                weekday=weekday
            )
            
            if not availability.is_available:
                return False
                
            # Sprawdź czy czas mieści się w godzinach pracy
            if not (availability.start_time <= time_slot and 
                    appointment_end.time() <= availability.end_time):
                return False
                
        except MechanicAvailability.DoesNotExist:
            # Brak harmonogramu = niedostępny
            return False
        
        # Sprawdź czy mechanik nie ma przerwy w tym czasie
        breaks = MechanicBreak.objects.filter(
            workshop_mechanic=workshop_mechanic,
            start_date__lte=date,
            end_date__gte=date
        )
        
        for break_obj in breaks:
            if break_obj.overlaps_with_slot(date, time_slot):
                return False
        
        # Sprawdź czy mechanik nie ma już appointment w tym czasie
        existing_appointments = Appointment.objects.filter(
            assigned_mechanic=workshop_mechanic.mechanic,
            date__date=date,
            status__in=['scheduled', 'in_progress']
        )
        
        for existing_apt in existing_appointments:
            existing_end = existing_apt.estimated_end_time
            if (appointment_time < existing_end and 
                appointment_end > existing_apt.date):
                return False
        
        return True
    
    @staticmethod
    def get_available_time_slots(workshop_id, date, duration_minutes=60):
        """
        Zwraca słownik dostępnych slotów czasowych z listą dostępnych mechaników
        """
        workshop_mechanics = MechanicAvailabilityService.get_workshop_mechanics(workshop_id)
        
        if not workshop_mechanics:
            return {}
        
        # Znajdź wszystkie możliwe sloty na podstawie harmonogramów mechaników
        all_slots = set()
        weekday = date.weekday()
        
        for workshop_mechanic in workshop_mechanics:
            try:
                availability = MechanicAvailability.objects.get(
                    workshop_mechanic=workshop_mechanic,
                    weekday=weekday
                )
                
                if availability.is_available:
                    # Generuj sloty co 30 minut
                    current_time = availability.start_time
                    while current_time <= availability.end_time:
                        # Sprawdź czy cały appointment zmieści się przed końcem pracy
                        slot_end_time = (
                            datetime.combine(date, current_time) + 
                            timedelta(minutes=duration_minutes)
                        ).time()
                        
                        if slot_end_time <= availability.end_time:
                            all_slots.add(current_time)
                        
                        # Następny slot za 30 minut
                        current_datetime = datetime.combine(date, current_time)
                        current_datetime += timedelta(minutes=30)
                        current_time = current_datetime.time()
                        
            except MechanicAvailability.DoesNotExist:
                continue
        
        # Dla każdego slotu sprawdź dostępnych mechaników
        slots_with_mechanics = {}
        for time_slot in sorted(all_slots):
            available_mechanics = MechanicAvailabilityService.get_available_mechanics(
                workshop_id, date, time_slot, duration_minutes
            )
            
            if available_mechanics:
                slots_with_mechanics[time_slot] = available_mechanics
        
        return slots_with_mechanics
    
    @staticmethod
    def auto_assign_mechanic(workshop_id, date, time_slot, duration_minutes=60):
        """
        Automatycznie przypisuje mechanika na podstawie dostępności
        """
        available_mechanics = MechanicAvailabilityService.get_available_mechanics(
            workshop_id, date, time_slot, duration_minutes
        )
        
        if available_mechanics:
            # Prosta strategia - wybierz pierwszego dostępnego
            # Można rozwinąć o bardziej zaawansowane algorytmy
            return available_mechanics[0]
        
        return None