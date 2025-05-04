from ..models import Invoice
from backend.repositories.baseRepository import BaseRepository

class InvoiceRepository(BaseRepository):
    model = Invoice