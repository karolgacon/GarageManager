from django.urls import path, include
from .routers import router, urlpatterns  # Import routera z osobnego pliku

urlpatterns = [
    path('', include(router.urls)),
]