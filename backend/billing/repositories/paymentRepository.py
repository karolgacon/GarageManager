from ..models import Payment
from backend.repositories.baseRepository import BaseRepository

class PaymentRepository(BaseRepository):
    model = Payment