from backend.services.baseService import BaseService
from ..repositories.serviceRepository import ServiceRepository

class ServiceService(BaseService):
    repository = ServiceRepository