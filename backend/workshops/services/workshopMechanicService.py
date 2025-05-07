from backend.services.baseService import BaseService
from ..repositories.workshopMechanicRepository import WorkshopMechanicRepository

class WorkshopMechanicService(BaseService):
    repository = WorkshopMechanicRepository