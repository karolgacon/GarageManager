from ..models import Part
from backend.repositories.baseRepository import BaseRepository

class PartRepository(BaseRepository):
    model = Part