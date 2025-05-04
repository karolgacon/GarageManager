from backend.services.baseService import BaseService
from ..repositories.partRepository import PartRepository

class PartService(BaseService):
    repository = PartRepository