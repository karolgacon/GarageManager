from ..models import Payment, Invoice
from backend.repositories.baseRepository import BaseRepository

class PaymentRepository(BaseRepository):
    model = Payment

    @classmethod
    def create(cls, data):
        """
        Creates a new payment record with proper handling of foreign keys
        """

        processed_data = data.copy()

        if 'invoice' in processed_data and isinstance(processed_data['invoice'], (int, str)):
            try:
                processed_data['invoice'] = Invoice.objects.get(id=processed_data['invoice'])
            except Invoice.DoesNotExist:
                raise ValueError(f"Invoice with ID {processed_data['invoice']} does not exist")

        return super().create(processed_data)

    @classmethod
    def update(cls, record_id, data):
        """
        Updates a payment record with proper handling of foreign keys
        """

        processed_data = data.copy()

        if 'invoice' in processed_data and isinstance(processed_data['invoice'], (int, str)):
            try:
                processed_data['invoice'] = Invoice.objects.get(id=processed_data['invoice'])
            except Invoice.DoesNotExist:
                raise ValueError(f"Invoice with ID {processed_data['invoice']} does not exist")

        return super().update(record_id, processed_data)