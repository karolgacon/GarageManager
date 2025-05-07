from backend.repositories.baseRepository import BaseRepository
from ..models import Workshop

class WorkshopRepository(BaseRepository):
    model = Workshop