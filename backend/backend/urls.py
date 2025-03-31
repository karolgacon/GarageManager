"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView # type: ignore
from drf_spectacular.views import SpectacularRedocView, SpectacularSwaggerView # type: ignore

from users import urls as users_urls
from users import routers as users_routers

from workshops import urls as workshops_urls
from workshops import routers as workshops_routers

from vehicles import urls as vehicles_urls
from vehicles import routers as vehicles_routers

urlpatterns = [
    path('api/v1/admin/', admin.site.urls),
    path('api/v1/api-auth/', include("rest_framework.urls")),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path("api/v1/", include(users_urls)),
    path("api/v1/", include(users_routers)),
    path("api/v1/", include(workshops_urls)),
    path("api/v1/", include(workshops_routers)),
    path("api/v1/", include(vehicles_urls)),
    path("api/v1/", include(vehicles_routers)),
]
