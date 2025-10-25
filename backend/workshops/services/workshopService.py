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

            try:
                from vehicles.models import Vehicle
                vehicles_in_workshop = Vehicle.objects.filter(workshop_id=workshop_id)

                for vehicle in vehicles_in_workshop[:3]:
                    print(f"[DEBUG] Vehicle: {vehicle.id}, client: {vehicle.client}")

            except Exception as e:

                try:
                    vehicles_in_workshop = Vehicle.objects.filter(workshop=workshop_id)
                except Exception as e2:
                    return User.objects.none()

            try:
                customers = User.objects.filter(
                    role='client',
                    is_active=True,
                    vehicles__workshop_id=workshop_id
                ).select_related('profile').distinct()

                return customers

            except Exception as e:

                customers = User.objects.filter(
                    role='client',
                    is_active=True,
                    vehicles__workshop=workshop_id
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

            workshop_id = None

            if hasattr(user, 'workshop_id') and user.workshop_id:
                workshop_id = user.workshop_id
            elif hasattr(user, 'workshop') and user.workshop:
                workshop_id = user.workshop.id
            else:

                user_vehicle = user.vehicles.first()
                if user_vehicle and hasattr(user_vehicle, 'workshop_id') and user_vehicle.workshop_id:
                    workshop_id = user_vehicle.workshop_id
                elif user_vehicle and hasattr(user_vehicle, 'workshop') and user_vehicle.workshop:
                    workshop_id = user_vehicle.workshop.id

            if not workshop_id:
                return User.objects.none()

            return WorkshopService.get_workshop_customers(workshop_id)

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
        from ..models import Workshop
        User = get_user_model()

        try:
            user = User.objects.get(id=user_id)

            workshop_id = None

            if hasattr(user, 'workshop_id') and user.workshop_id:
                workshop_id = user.workshop_id
            elif hasattr(user, 'workshop') and user.workshop:
                return user.workshop
            else:

                user_vehicle = user.vehicles.first()
                if user_vehicle and hasattr(user_vehicle, 'workshop_id') and user_vehicle.workshop_id:
                    workshop_id = user_vehicle.workshop_id
                elif user_vehicle and hasattr(user_vehicle, 'workshop') and user_vehicle.workshop:
                    workshop_id = user_vehicle.workshop.id

            if workshop_id:
                workshop = Workshop.objects.get(id=workshop_id)
                return workshop

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

            user_fields = [f.name for f in User._meta.get_fields()]

            from django.db.models import Q

            staff = User.objects.filter(
                Q(role='owner', is_active=True, owned_workshops__id=workshop_id) |
                Q(role='mechanic', is_active=True, workshopmechanic__workshop_id=workshop_id)
            ).select_related('profile').distinct()


            if staff.exists():
                return staff

            try:
                staff = User.objects.filter(
                    role__in=['owner', 'mechanic'],
                    is_active=True,
                    vehicles__workshop_id=workshop_id
                ).select_related('profile').distinct()

                return staff

            except Exception as e:
                return User.objects.none()

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

            mechanics = User.objects.filter(
                role='mechanic',
                is_active=True,
                workshopmechanic__workshop_id=workshop_id
            ).select_related('profile').distinct()


            if mechanics.exists():
                return mechanics

            try:
                mechanics = User.objects.filter(
                    role='mechanic',
                    is_active=True,
                    vehicles__workshop_id=workshop_id
                ).select_related('profile').distinct()

                return mechanics

            except Exception as e:
                return User.objects.none()

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