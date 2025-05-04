from ..models import Payment

class PaymentRepository:
    @staticmethod
    def get_all_payments():
        """
        Retrieves all payments from the database.
        """
        try:
            payments = Payment.objects.all()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving payments: {str(e)}")
        return payments
    
    @staticmethod
    def create_payment(data):
        """
        Creates a new payment in the database.
        """
        try:
            payment = Payment.objects.create(**data)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error creating payment: {str(e)}")
        return payment
    
    @staticmethod
    def get_payment_by_id(payment_id):
        """
        Retrieves a payment by its ID.
        """
        try:
            payment = Payment.objects.filter(id=payment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving payment: {str(e)}")
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} does not exist.")
        return payment
    
    @staticmethod
    def delete_payment(payment_id):
        """
        Deletes a payment by its ID.
        """
        try:
            payment = Payment.objects.filter(id=payment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error deleting payment: {str(e)}")
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} does not exist.")
        payment.delete()
        return True
    
    @staticmethod
    def update_payment(payment_id, data):
        """
        Updates a payment by its ID.
        """
        try:
            payment = Payment.objects.filter(id=payment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error updating payment: {str(e)}")
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} does not exist.")
        for key, value in data.items():
            setattr(payment, key, value)
        payment.save()
        return payment
    
    @staticmethod
    def partially_update_payment(payment_id, data):
        """
        Partially updates a payment by its ID.
        """
        try:
            payment = Payment.objects.filter(id=payment_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error partially updating payment: {str(e)}")
        if not payment:
            raise ValueError(f"Payment with ID {payment_id} does not exist.")
        for key, value in data.items():
            setattr(payment, key, value)
        payment.save()
        return payment  