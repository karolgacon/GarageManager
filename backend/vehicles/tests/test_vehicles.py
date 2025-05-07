import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django  # type: ignore
django.setup()
import pytest
from datetime import timedelta
from django.utils.timezone import now
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from vehicles.models import Vehicle
from users.models import User
from django.urls import reverse
from vehicles.repositories.vehicleRepository import VehicleRepository
from vehicles.services.vehicleService import VehicleService


# Fixtures
@pytest.fixture
def client_user(db):
    return User.objects.create_user(username="test_client", email="test_client@example.com", password="password123")

@pytest.fixture
def vehicle(db, client_user):
    return Vehicle.objects.create(
        client=client_user,
        brand="toyota",
        model="Corolla",
        registration_number="ABC123",
        vin="1HGCM82633A123456",
        manufacture_year=2020,
        last_maintenance_date=None
    )

@pytest.fixture
def api_client(client_user):
    client = APIClient()
    refresh = RefreshToken.for_user(client_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

# Unit Tests
@pytest.mark.django_db
def test_vehicle_creation(vehicle):
    assert Vehicle.objects.count() == 1
    assert vehicle.brand == "toyota"
    assert vehicle.model == "Corolla"

@pytest.mark.django_db
def test_vehicle_str_representation(vehicle):
    expected_str = f"{vehicle.brand} {vehicle.model} ({vehicle.registration_number})"
    assert str(vehicle) == expected_str

@pytest.mark.django_db
def test_get_vehicles_by_brand(vehicle):
    vehicles = VehicleService.get_vehicles_by_brand("toyota")
    assert len(vehicles) == 1
    assert vehicles[0].brand == "toyota"


# Integration Tests
@pytest.mark.django_db
def test_list_vehicles(api_client, vehicle):
    url = reverse("vehicles-list")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["brand"] == "toyota"

@pytest.mark.django_db
def test_create_vehicle(api_client, client_user):
    url = reverse("vehicles-list")
    data = {
        "client": client_user.id,
        "brand": "ford",
        "model": "Focus",
        "registration_number": "XYZ789",
        "vin": "1HGCM82633A654321",
        "manufacture_year": 2021
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert Vehicle.objects.count() == 1

@pytest.mark.django_db
def test_update_vehicle(api_client, vehicle):
    url = reverse("vehicles-detail", args=[vehicle.id])
    data = {"brand": "honda", "model": "Civic"}
    response = api_client.patch(url, data, format="json")
    assert response.status_code == status.HTTP_200_OK
    vehicle.refresh_from_db()
    assert vehicle.brand == "honda"
    assert vehicle.model == "Civic"

@pytest.mark.django_db
def test_delete_vehicle(api_client, vehicle):
    url = reverse("vehicles-detail", args=[vehicle.id])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Vehicle.objects.count() == 0

@pytest.mark.django_db
def test_list_vehicles_by_brand(api_client, vehicle):
    url = reverse("vehicles-by-brand") + "?brand=toyota"
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]["brand"] == "toyota"

@pytest.mark.django_db
def test_create_vehicle_invalid_brand(api_client, client_user):
    url = reverse("vehicles-list")
    data = {
        "client": client_user.id,
        "brand": "invalid_brand",  # Invalid brand
        "model": "Focus",
        "registration_number": "XYZ789",
        "vin": "1HGCM82633A654321",
        "manufacture_year": 2021
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "brand" in response.data  # Ensure the error is related to the brand

@pytest.mark.django_db
def test_create_vehicle_missing_fields(api_client, client_user):
    url = reverse("vehicles-list")
    data = {
        "client": client_user.id,
        # Missing required fields like brand, model, etc.
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "brand" in response.data
    assert "model" in response.data

# @pytest.mark.django_db
# def test_update_vehicle_invalid_brand(api_client, vehicle):
#     url = reverse("vehicles-detail", args=[vehicle.id])
#     data = {"brand": "amerena"}  # Invalid brand
#     response = api_client.patch(url, data, format="json")
#     assert response.status_code == status.HTTP_400_BAD_REQUEST
#     assert "brand" in response.data

@pytest.mark.django_db
def test_list_vehicles_by_invalid_brand(api_client):
    url = reverse("vehicles-by-brand") + "?brand=invalid_brand"
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 0
