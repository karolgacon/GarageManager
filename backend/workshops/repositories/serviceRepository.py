from backend.repositories.baseRepository import BaseRepository
from ..models import Service

class ServiceRepository(BaseRepository):
    model = Service