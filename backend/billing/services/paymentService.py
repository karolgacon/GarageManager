from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.paymentRepository import PaymentRepository
from backend.services.baseService import BaseService

class PaymentService(BaseService):
    repository = PaymentRepository