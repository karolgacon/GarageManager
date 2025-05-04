from backend.views_collection.BaseView import BaseViewSet
from ..services.invoiceService import InvoiceService
from ..serializers import InvoiceSerializer

class InvoiceViewSet(BaseViewSet):
    service = InvoiceService
    serializer_class = InvoiceSerializer