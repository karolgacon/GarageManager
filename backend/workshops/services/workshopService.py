from backend.services.baseService import BaseService
from ..repositories.workshopRepository import WorkshopRepository

class WorkshopService(BaseService):
    repository = WorkshopRepository

    @staticmethod
    def get_workshop_customers(workshop_id):
        """
        Pobiera wszystkich klientów (users z rolą 'client') którzy mają wizyty w określonym warsztacie.
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            # Znajdź klientów przez appointments w warsztacie
            customers = User.objects.filter(
                role='client',
                is_active=True,
                appointments__workshop_id=workshop_id
            ).select_related('profile').distinct()

            return customers

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Error fetching workshop customers: {str(e)}")

    @staticmethod
    def get_user_workshop_customers(user_id):
        """
        Pobiera wszystkich klientów warsztatu dla określonego użytkownika (mechanik/właściciel).
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            user = User.objects.get(id=user_id)
            workshop = None

            # Sprawdź czy użytkownik jest właścicielem warsztatu
            if user.role == 'owner':
                workshop = user.owned_workshops.first()
            
            # Sprawdź czy użytkownik jest mechanikiem w warsztacie
            elif user.role == 'mechanic':
                from ..models import WorkshopMechanic
                workshop_mechanic = WorkshopMechanic.objects.filter(mechanic=user).first()
                if workshop_mechanic:
                    workshop = workshop_mechanic.workshop

            if not workshop:
                return User.objects.none()

            return WorkshopService.get_workshop_customers(workshop.id)

        except User.DoesNotExist:
            return User.objects.none()
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Error fetching user workshop customers: {str(e)}")

    @staticmethod
    def get_user_workshop(user_id):
        """
        Pobiera warsztat przypisany do użytkownika.
        """
        from django.contrib.auth import get_user_model
        from ..models import Workshop, WorkshopMechanic
        User = get_user_model()

        try:
            user = User.objects.get(id=user_id)

            # Sprawdź czy użytkownik jest właścicielem warsztatu
            if user.role == 'owner':
                workshop = user.owned_workshops.first()
                if workshop:
                    return workshop
            
            # Sprawdź czy użytkownik jest mechanikiem w warsztacie
            elif user.role == 'mechanic':
                workshop_mechanic = WorkshopMechanic.objects.filter(mechanic=user).first()
                if workshop_mechanic:
                    return workshop_mechanic.workshop

            return None

        except (User.DoesNotExist, Workshop.DoesNotExist) as e:
            return None
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Error fetching user workshop: {str(e)}")

    @staticmethod
    def get_workshop_staff(workshop_id):
        """
        Pobiera wszystkich pracowników (owner i mechanic) przypisanych do warsztatu.
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            from django.db.models import Q
            
            # Pobierz właściciela warsztatu i mechaników
            staff = User.objects.filter(
                Q(role='owner', is_active=True, owned_workshops__id=workshop_id) |
                Q(role='mechanic', is_active=True, workshopmechanic__workshop_id=workshop_id)
            ).select_related('profile').distinct()

            return staff

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Error fetching workshop staff: {str(e)}")

    @staticmethod
    def get_workshop_mechanics(workshop_id):
        """
        Pobiera wszystkich mechaników przypisanych do warsztatu.
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()

        try:
            # Pobierz mechaników przez WorkshopMechanic
            mechanics = User.objects.filter(
                role='mechanic',
                is_active=True,
                workshopmechanic__workshop_id=workshop_id
            ).select_related('profile').distinct()

            return mechanics

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise Exception(f"Error fetching workshop mechanics: {str(e)}")

    @staticmethod
    def get_workshop_staff_alternative(workshop_id):
        """
        Alternatywna metoda pobierania pracowników warsztatu przez raw SQL.
        """
        from django.contrib.auth import get_user_model
        from django.db import connection
        User = get_user_model()

        try:

            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT DISTINCT u.id, u.username, u.first_name, u.last_name, u.email, u.role
                    FROM users_user u
                    LEFT JOIN workshops_workshopmechanic wm ON u.id = wm.mechanic_id
                    LEFT JOIN workshops_workshop w ON u.id = w.owner_id
                    WHERE u.is_active = true
                    AND u.role IN ('owner', 'mechanic')
                    AND (wm.workshop_id = %s OR w.id = %s)
                """, [workshop_id, workshop_id])

                rows = cursor.fetchall()

            user_ids = [row[0] for row in rows]
            staff = User.objects.filter(id__in=user_ids).select_related('profile')

            return staff

        except Exception as e:
            import traceback
            traceback.print_exc()
            return User.objects.none()
    
    @staticmethod
    def get_nearby_workshops(latitude, longitude, radius_km=50):
        """
        Znajdź warsztaty w pobliżu podanej lokalizacji w określonym promieniu.
        """
        from ..models import Workshop
        
        # Pobierz warsztaty z danymi geolokalizacyjnymi
        workshops = Workshop.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        nearby_workshops = []
        
        for workshop in workshops:
            distance = workshop.distance_to(latitude, longitude)
            if distance is not None and distance <= radius_km:
                nearby_workshops.append(workshop)
        
        # Sortuj według odległości
        nearby_workshops.sort(key=lambda w: w.distance_to(latitude, longitude))
        
        return nearby_workshops

    @staticmethod
    def search_workshops(query=None, location_lat=None, location_lng=None, sort_by='name', specialization=None, has_location=None):
        """
        Wyszukaj warsztaty z możliwością sortowania i filtrowania
        """
        from ..models import Workshop
        from django.db.models import Q
        
        workshops = Workshop.objects.all()
        
        # Filtrowanie po nazwie/lokalizacji
        if query:
            workshops = workshops.filter(
                Q(name__icontains=query) | 
                Q(location__icontains=query) |
                Q(address_full__icontains=query)
            )
        
        # Filtrowanie po specjalizacji
        if specialization:
            workshops = workshops.filter(specialization=specialization)
        
        # Filtrowanie warsztatów z danymi geolokalizacji
        if has_location:
            workshops = workshops.filter(
                latitude__isnull=False,
                longitude__isnull=False
            )
        
        workshops_list = list(workshops)
        
        # Dodanie odległości dla warsztatów z geolokalizacją
        if location_lat and location_lng:
            for workshop in workshops_list:
                if workshop.has_location_data:
                    workshop.calculated_distance = workshop.distance_to(float(location_lat), float(location_lng))
                else:
                    workshop.calculated_distance = None
        
        # Sortowanie
        if sort_by == 'distance' and location_lat and location_lng:
            workshops_list = [w for w in workshops_list if hasattr(w, 'calculated_distance') and w.calculated_distance is not None]
            workshops_list.sort(key=lambda w: w.calculated_distance)
        elif sort_by == 'rating':
            workshops_list.sort(key=lambda w: w.rating, reverse=True)
        elif sort_by == 'name':
            workshops_list.sort(key=lambda w: w.name)
        
        return workshops_list

    @staticmethod
    def get_workshop_specializations():
        """Pobierz dostępne specjalizacje warsztatów"""
        from ..models import Workshop
        return Workshop.SPECIALIZATION_CHOICES