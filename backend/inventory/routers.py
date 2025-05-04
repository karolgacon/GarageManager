from rest_framework.routers import DefaultRouter
from .views_collection.RepairJobPartView import RepairJobPartViewSet
from .views_collection.PartView import PartViewSet
from .views_collection.StockEntryView import StockEntryViewSet

router = DefaultRouter()

router.register(r'repair-job-parts', RepairJobPartViewSet, basename='repair-job-parts')
router.register(r'parts', PartViewSet, basename='parts')
router.register(r'stock-entries', StockEntryViewSet, basename='stock-entries')

urlpatterns = router.urls