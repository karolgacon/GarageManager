from rest_framework.routers import DefaultRouter
from .views_collection.AppointmentView import AppointmentViewSet
from .views_collection.RepairJobView import RepairJobViewSet
from .views_collection.CustomerFeedbackView import CustomerFeedbackViewSet

router = DefaultRouter()

router.register(r'appointments', AppointmentViewSet)
router.register(r'repair-jobs', RepairJobViewSet)
router.register(r'customer-feedbacks', CustomerFeedbackViewSet)

urlpatterns = router.urls