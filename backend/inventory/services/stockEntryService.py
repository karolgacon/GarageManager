from ..repositories.stockEntryRepository import StockEntryRepository
from backend.services.baseService import BaseService

class StockEntryService(BaseService):
    repository = StockEntryRepository
