from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.invoiceRepository import InvoiceRepository

class InvoiceService:
    @staticmethod
    def get_all_invoices():
        """
        Retrieves all invoices from the database.
        """
        try:
            return InvoiceRepository.get_all_invoices()
        except Exception as e:
            raise RuntimeError(f"Error retrieving invoices: {str(e)}")

    @staticmethod
    def create_invoice(data):
        """
        Creates a new invoice in the database.
        """
        try:
            return InvoiceRepository.create_invoice(data)
        except ValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise RuntimeError(f"Error creating invoice: {str(e)}")

    @staticmethod
    def get_invoice_by_id(invoice_id):
        """
        Retrieves an invoice by its ID.
        """
        try:
            return InvoiceRepository.get_invoice_by_id(invoice_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving invoice: {str(e)}")

    @staticmethod
    def delete_invoice(invoice_id):
        """
        Deletes an invoice by its ID.
        """
        try:
            return InvoiceRepository.delete_invoice(invoice_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error deleting invoice: {str(e)}")

    @staticmethod
    def update_invoice(invoice_id, data):
        """
        Updates an existing invoice.
        """
        try:
            return InvoiceRepository.update_invoice(invoice_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error updating invoice: {str(e)}")

    @staticmethod
    def partially_update_invoice(invoice_id, data):
        """
        Partially updates an existing invoice.
        """
        try:
            return InvoiceRepository.partially_update_invoice(invoice_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error partially updating invoice: {str(e)}")