from backend.views_collection.BaseView import BaseViewSet
from ..services.partService import PartService
from ..serializers import PartSerializer

class PartViewSet(BaseViewSet):
    service = PartService
    serializer_class = PartSerializer