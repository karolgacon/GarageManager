from backend.views_collection.BaseView import BaseViewSet
from ..services.repairJobPartService import RepairJobPartService
from ..serializers import RepairJobPartSerializer

class RepairJobPartViewSet(BaseViewSet):
    service = RepairJobPartService
    serializer_class = RepairJobPartSerializer