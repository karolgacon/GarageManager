from ..models import Invoice

class InvoiceRepository:
    @staticmethod
    def get_all_invoices():
        """
        Retrieves all invoices from the database.
        """
        try:
            invoices = Invoice.objects.all()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving invoices: {str(e)}")
        return invoices

    @staticmethod
    def create_invoice(data):
        """
        Creates a new invoice in the database.
        """
        try:
            invoice = Invoice.objects.create(**data)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error creating invoice: {str(e)}")
        return invoice

    @staticmethod
    def get_invoice_by_id(invoice_id):
        """
        Retrieves an invoice by its ID.
        """
        try:
            invoice = Invoice.objects.filter(id=invoice_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving invoice: {str(e)}")
        if not invoice:
            raise ValueError(f"Invoice with ID {invoice_id} does not exist.")
        return invoice
    
    @staticmethod
    def delete_invoice(invoice_id):
        """
        Deletes an invoice by its ID.
        """
        try:
            invoice = Invoice.objects.filter(id=invoice_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error deleting invoice: {str(e)}")
        if not invoice:
            raise ValueError(f"Invoice with ID {invoice_id} does not exist.")
        invoice.delete()
        return True
    
    @staticmethod
    def update_invoice(invoice_id, data):
        """
        Updates an existing invoice.
        """
        try:
            invoice = Invoice.objects.filter(id=invoice_id).first()
            if not invoice:
                raise ValueError(f"Invoice with ID {invoice_id} does not exist.")
            for key, value in data.items():
                setattr(invoice, key, value)
            invoice.save()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error updating invoice: {str(e)}")
        return invoice

    @staticmethod
    def partially_update_invoice(invoice_id, data):
        """
        Partially updates an existing invoice.
        """
        try:
            invoice = Invoice.objects.filter(id=invoice_id).first()
            if not invoice:
                raise ValueError(f"Invoice with ID {invoice_id} does not exist.")
            for key, value in data.items():
                setattr(invoice, key, value)
            invoice.save()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error partially updating invoice: {str(e)}")
        return invoice