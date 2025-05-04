from ..models import StockEntry
from backend.repositories.baseRepository import BaseRepository

class StockEntryRepository(BaseRepository):
    model = StockEntry
