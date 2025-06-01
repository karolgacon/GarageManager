from backend.services.baseService import BaseService
from ..repositories.workshopRepository import WorkshopRepository

class WorkshopService(BaseService):
    repository = WorkshopRepository

    @staticmethod
    def get_workshop_customers(workshop_id):
        """
        Pobiera wszystkich klientów (users z rolą 'client') którzy mają pojazdy przypisane do określonego warsztatu.
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            print(f"[DEBUG] Looking for customers in workshop_id: {workshop_id}")
            
            # Sprawdź czy istnieją pojazdy w tym warsztacie
            try:
                from vehicles.models import Vehicle
                vehicles_in_workshop = Vehicle.objects.filter(workshop_id=workshop_id)
                print(f"[DEBUG] Found {vehicles_in_workshop.count()} vehicles in workshop {workshop_id}")
                
                for vehicle in vehicles_in_workshop[:3]:  # Pokazuj tylko pierwsze 3
                    print(f"[DEBUG] Vehicle: {vehicle.id}, client: {vehicle.client}")
                    
            except Exception as e:
                print(f"[DEBUG] Error checking vehicles: {e}")
                # Fallback - spróbuj z workshop zamiast workshop_id
                try:
                    vehicles_in_workshop = Vehicle.objects.filter(workshop=workshop_id)
                    print(f"[DEBUG] Fallback: Found {vehicles_in_workshop.count()} vehicles with workshop={workshop_id}")
                except Exception as e2:
                    print(f"[DEBUG] Fallback also failed: {e2}")
                    return User.objects.none()
            
            # Pobierz klientów - UŻYJ vehicles (liczba mnoga)
            try:
                customers = User.objects.filter(
                    role='client',
                    is_active=True,
                    vehicles__workshop_id=workshop_id  # vehicles zamiast vehicle
                ).select_related('profile').distinct()
                
                print(f"[DEBUG] Found {customers.count()} customers with vehicles__workshop_id")
                return customers
                
            except Exception as e:
                print(f"[DEBUG] Error with vehicles__workshop_id, trying vehicles__workshop: {e}")
                # Fallback
                customers = User.objects.filter(
                    role='client',
                    is_active=True,
                    vehicles__workshop=workshop_id  # vehicles zamiast vehicle
                ).select_related('profile').distinct()
                
                print(f"[DEBUG] Fallback: Found {customers.count()} customers with vehicles__workshop")
                return customers
                
        except Exception as e:
            print(f"[DEBUG] Major error in get_workshop_customers: {e}")
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
            print(f"[DEBUG] Getting workshop customers for user_id: {user_id}")
            user = User.objects.get(id=user_id)
            print(f"[DEBUG] User: {user.username}, role: {user.role}")
            
            # Sprawdź czy user ma bezpośrednio przypisany warsztat
            workshop_id = None
            
            if hasattr(user, 'workshop_id') and user.workshop_id:
                workshop_id = user.workshop_id
                print(f"[DEBUG] User has workshop_id: {workshop_id}")
            elif hasattr(user, 'workshop') and user.workshop:
                workshop_id = user.workshop.id
                print(f"[DEBUG] User has workshop: {workshop_id}")
            else:
                print(f"[DEBUG] User has no direct workshop, checking vehicles...")
                # Sprawdź przez pojazdy użytkownika
                user_vehicle = user.vehicles.first()  # vehicles zamiast vehicle
                if user_vehicle and hasattr(user_vehicle, 'workshop_id') and user_vehicle.workshop_id:
                    workshop_id = user_vehicle.workshop_id
                    print(f"[DEBUG] Found workshop through user vehicle: {workshop_id}")
                elif user_vehicle and hasattr(user_vehicle, 'workshop') and user_vehicle.workshop:
                    workshop_id = user_vehicle.workshop.id
                    print(f"[DEBUG] Found workshop through user vehicle.workshop: {workshop_id}")
            
            if not workshop_id:
                print(f"[DEBUG] No workshop found for user")
                return User.objects.none()
            
            # Pobierz klientów tego warsztatu
            return WorkshopService.get_workshop_customers(workshop_id)
            
        except User.DoesNotExist:
            print(f"[DEBUG] User {user_id} does not exist")
            return User.objects.none()
        except Exception as e:
            print(f"[DEBUG] Error in get_user_workshop_customers: {e}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Error fetching user workshop customers: {str(e)}")

    @staticmethod
    def get_user_workshop(user_id):
        """
        Pobiera warsztat przypisany do użytkownika.
        """
        from django.contrib.auth import get_user_model
        from ..models import Workshop
        User = get_user_model()
        
        try:
            print(f"[DEBUG] Getting workshop for user_id: {user_id}")
            user = User.objects.get(id=user_id)
            
            workshop_id = None
            
            if hasattr(user, 'workshop_id') and user.workshop_id:
                workshop_id = user.workshop_id
                print(f"[DEBUG] User has workshop_id: {workshop_id}")
            elif hasattr(user, 'workshop') and user.workshop:
                print(f"[DEBUG] User has workshop object: {user.workshop.id}")
                return user.workshop
            else:
                print(f"[DEBUG] User has no direct workshop, checking vehicles...")
                # Sprawdź przez pojazdy użytkownika
                user_vehicle = user.vehicles.first()  # vehicles zamiast vehicle
                if user_vehicle and hasattr(user_vehicle, 'workshop_id') and user_vehicle.workshop_id:
                    workshop_id = user_vehicle.workshop_id
                    print(f"[DEBUG] Found workshop through user vehicle: {workshop_id}")
                elif user_vehicle and hasattr(user_vehicle, 'workshop') and user_vehicle.workshop:
                    workshop_id = user_vehicle.workshop.id
                    print(f"[DEBUG] Found workshop through user vehicle.workshop: {workshop_id}")
            
            if workshop_id:
                workshop = Workshop.objects.get(id=workshop_id)
                print(f"[DEBUG] Found workshop: {workshop.name}")
                return workshop
            
            return None
            
        except (User.DoesNotExist, Workshop.DoesNotExist) as e:
            print(f"[DEBUG] Workshop/User not found: {e}")
            return None
        except Exception as e:
            print(f"[DEBUG] Error in get_user_workshop: {e}")
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
            print(f"[DEBUG] Getting staff for workshop_id: {workshop_id}")
            
            # Sprawdź dostępne pola w User modelu
            user_fields = [f.name for f in User._meta.get_fields()]
            print(f"[DEBUG] Available User fields: {user_fields}")
            
            # Użyj kombinacji różnych relacji
            from django.db.models import Q
            
            staff = User.objects.filter(
                Q(role='owner', is_active=True, owned_workshops__id=workshop_id) |
                Q(role='mechanic', is_active=True, workshopmechanic__workshop_id=workshop_id)
            ).select_related('profile').distinct()
            
            print(f"[DEBUG] Found {staff.count()} staff members")
            
            if staff.exists():
                return staff
            
            # Fallback - sprawdź przez workshop relationship na vehicle
            try:
                staff = User.objects.filter(
                    role__in=['owner', 'mechanic'],
                    is_active=True,
                    vehicles__workshop_id=workshop_id
                ).select_related('profile').distinct()
                
                print(f"[DEBUG] Fallback: Found {staff.count()} staff members through vehicles")
                return staff
                
            except Exception as e:
                print(f"[DEBUG] Fallback failed: {e}")
                return User.objects.none()
                
        except Exception as e:
            print(f"[DEBUG] Error in get_workshop_staff: {e}")
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
            print(f"[DEBUG] Getting mechanics for workshop_id: {workshop_id}")
            
            # Użyj relacji workshopmechanic
            mechanics = User.objects.filter(
                role='mechanic',
                is_active=True,
                workshopmechanic__workshop_id=workshop_id
            ).select_related('profile').distinct()
            
            print(f"[DEBUG] Found {mechanics.count()} mechanics with workshopmechanic__workshop_id")
            
            if mechanics.exists():
                return mechanics
            
            # Fallback - sprawdź przez vehicles relationship
            try:
                mechanics = User.objects.filter(
                    role='mechanic',
                    is_active=True,
                    vehicles__workshop_id=workshop_id
                ).select_related('profile').distinct()
                
                print(f"[DEBUG] Fallback: Found {mechanics.count()} mechanics through vehicles")
                return mechanics
                
            except Exception as e:
                print(f"[DEBUG] Fallback failed: {e}")
                return User.objects.none()
                
        except Exception as e:
            print(f"[DEBUG] Error in get_workshop_mechanics: {e}")
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
            print(f"[DEBUG] Getting staff for workshop_id: {workshop_id} using alternative method")
            
            # Bezpośrednie zapytanie SQL do tabeli WorkshopMechanic
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
                
            # Konwertuj na User objects
            user_ids = [row[0] for row in rows]
            staff = User.objects.filter(id__in=user_ids).select_related('profile')
            
            print(f"[DEBUG] Alternative method found {staff.count()} staff members")
            return staff
            
        except Exception as e:
            print(f"[DEBUG] Error in alternative method: {e}")
            import traceback
            traceback.print_exc()
            return User.objects.none()