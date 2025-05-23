from rest_framework.routers import DefaultRouter
from .views_collection.PaymentView import PaymentViewSet
from .views_collection.InvoiceView import InvoiceViewSet

router = DefaultRouter()

router.register(r'payments', PaymentViewSet, basename='payments')
router.register(r'invoices', InvoiceViewSet, basename='invoices')

urlpatterns = router.urls