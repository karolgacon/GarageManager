from rest_framework.routers import DefaultRouter
from .views_collection.RepairJobPartView import RepairJobPartViewSet
from .views_collection.PartView import PartViewSet
from .views_collection.StockEntryView import StockEntryViewSet

router = DefaultRouter()

router.register(r'repair-job-parts', RepairJobPartViewSet)
router.register(r'parts', PartViewSet)
router.register(r'stock-entries', StockEntryViewSet)

urlpatterns = router.urls