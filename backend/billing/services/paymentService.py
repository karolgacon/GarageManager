from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.paymentRepository import PaymentRepository

class PaymentService:
    @staticmethod
    def get_all_payments():
        """
        Retrieves all payments from the database.
        """
        try:
            return PaymentRepository.get_all_payments()
        except Exception as e:
            raise RuntimeError(f"Error retrieving payments: {str(e)}")

    @staticmethod
    def create_payment(data):
        """
        Creates a new payment in the database.
        """
        try:
            return PaymentRepository.create_payment(data)
        except ValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise RuntimeError(f"Error creating payment: {str(e)}")

    @staticmethod
    def get_payment_by_id(payment_id):
        """
        Retrieves a payment by its ID.
        """
        try:
            return PaymentRepository.get_payment_by_id(payment_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving payment: {str(e)}")

    @staticmethod
    def delete_payment(payment_id):
        """
        Deletes a payment by its ID.
        """
        try:
            return PaymentRepository.delete_payment(payment_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error deleting payment: {str(e)}")

    @staticmethod
    def update_payment(payment_id, data):
        """
        Updates an existing payment.
        """
        try:
            return PaymentRepository.update_payment(payment_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error updating payment: {str(e)}")

    @staticmethod
    def partially_update_payment(payment_id, data):
        """
        Partially updates an existing payment.
        """
        try:
            return PaymentRepository.partially_update_payment(payment_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error partially updating payment: {str(e)}")