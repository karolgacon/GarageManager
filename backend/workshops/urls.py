from django.urls import path, include
from .routers import router  # Import routera z osobnego pliku

urlpatterns = [
    path('', include(router.urls)),  # Podłączenie wszystkich endpointów API
]
