from backend.views_collection.BaseView import BaseViewSet
from ..services.paymentService import PaymentService
from ..serializers import PaymentSerializer

class PaymentViewSet(BaseViewSet):
    service = PaymentService
    serializer_class = PaymentSerializer