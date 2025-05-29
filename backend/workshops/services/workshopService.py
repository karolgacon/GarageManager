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