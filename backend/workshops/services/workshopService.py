from backend.services.baseService import BaseService
from ..repositories.workshopRepository import WorkshopRepository

class WorkshopService(BaseService):
    repository = WorkshopRepository