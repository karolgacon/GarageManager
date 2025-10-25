from backend.services.baseService import BaseService
from ..repositories.supplierRepository import SupplierRepository

class SupplierService(BaseService):
    repository = SupplierRepository

    @staticmethod
    def get_supplier_parts(supplier_id):
        """
        Pobiera wszystkie części dostępne od określonego dostawcy.
        """
        from ..models import Part
        
        try:
            parts = Part.objects.filter(supplier_id=supplier_id)
            return parts
        except Exception as e:
            raise Exception(f"Error fetching supplier parts: {str(e)}")

    @staticmethod
    def get_active_suppliers():
        """
        Pobiera tylko aktywnych dostawców.
        """
        from ..models import Supplier
        
        try:
            suppliers = Supplier.objects.filter(is_active=True).order_by('name')
            return suppliers
        except Exception as e:
            raise Exception(f"Error fetching active suppliers: {str(e)}")

    @staticmethod
    def search_suppliers(query):
        """
        Wyszukuje dostawców po nazwie lub danych kontaktowych.
        """
        from django.db.models import Q
        from ..models import Supplier
        
        try:
            suppliers = Supplier.objects.filter(
                Q(name__icontains=query) |
                Q(contact_person__icontains=query) |
                Q(email__icontains=query) |
                Q(city__icontains=query)
            ).filter(is_active=True).order_by('name')
            
            return suppliers
        except Exception as e:
            raise Exception(f"Error searching suppliers: {str(e)}")

    @staticmethod
    def get_supplier_with_stats(supplier_id):
        """
        Pobiera dostawcę wraz ze statystykami (liczba części, zamówienia itp.).
        """
        from django.db.models import F
        from ..models import Supplier, Part
        
        try:
            supplier = Supplier.objects.get(id=supplier_id)
            
            # Dodaj statystyki
            parts_count = Part.objects.filter(supplier=supplier).count()
            low_stock_parts = Part.objects.filter(
                supplier=supplier,
                stock_quantity__lte=F('minimum_stock_level')
            ).count()
            
            # Możesz dodać więcej statystyk
            supplier.stats = {
                'parts_count': parts_count,
                'low_stock_parts': low_stock_parts,
            }
            
            return supplier
        except Supplier.DoesNotExist:
            raise Exception("Supplier not found")
        except Exception as e:
            raise Exception(f"Error fetching supplier with stats: {str(e)}")