from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.invoiceRepository import InvoiceRepository
from backend.services.baseService import BaseService

class InvoiceService(BaseService):
    repository = InvoiceRepository