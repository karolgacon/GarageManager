from ..models import Payment, Invoice
from backend.repositories.baseRepository import BaseRepository

class PaymentRepository(BaseRepository):
    model = Payment
    
    @classmethod
    def create(cls, data):
        """
        Creates a new payment record with proper handling of foreign keys
        """
        # Make a copy to avoid modifying the original data
        processed_data = data.copy()
        
        # Convert invoice ID to Invoice instance
        if 'invoice' in processed_data and isinstance(processed_data['invoice'], (int, str)):
            try:
                processed_data['invoice'] = Invoice.objects.get(id=processed_data['invoice'])
            except Invoice.DoesNotExist:
                raise ValueError(f"Invoice with ID {processed_data['invoice']} does not exist")
        
        # Use the parent class's create method with processed data
        return super().create(processed_data)
    
    @classmethod
    def update(cls, record_id, data):
        """
        Updates a payment record with proper handling of foreign keys
        """
        # Make a copy to avoid modifying the original data
        processed_data = data.copy()
        
        # Convert invoice ID to Invoice instance
        if 'invoice' in processed_data and isinstance(processed_data['invoice'], (int, str)):
            try:
                processed_data['invoice'] = Invoice.objects.get(id=processed_data['invoice'])
            except Invoice.DoesNotExist:
                raise ValueError(f"Invoice with ID {processed_data['invoice']} does not exist")
        
        # Use the parent class's update method with processed data
        return super().update(record_id, processed_data)