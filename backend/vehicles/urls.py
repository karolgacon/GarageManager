from django.urls import path, include
from .routers import router, urlpatterns

urlpatterns = [
    path('', include(router.urls)),
]