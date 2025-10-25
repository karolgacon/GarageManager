from backend.repositories.baseRepository import BaseRepository
from ..models import Supplier

class SupplierRepository(BaseRepository):
    model = Supplier