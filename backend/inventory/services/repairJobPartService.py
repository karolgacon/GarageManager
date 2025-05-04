from ..repositories.repairJobPartRepository import RepairJobPartRepository
from backend.services.baseService import BaseService

class RepairJobPartService(BaseService):
    repository = RepairJobPartRepository