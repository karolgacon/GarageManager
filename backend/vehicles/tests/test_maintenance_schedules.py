import pytest
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from vehicles.models import Vehicle
from vehicles.models import MaintenanceSchedule
from users.models import User
from django.urls import reverse
from datetime import timedelta
from django.utils.timezone import now

import os

from django.forms import ValidationError
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django # type: ignore
django.setup()

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
        manufacture_year=2020
    )

@pytest.fixture
def maintenance_schedule(db, vehicle):
    return MaintenanceSchedule.objects.create(
        vehicle=vehicle,
        service_type="oil_change",
        recommended_date=now() + timedelta(days=30),
        next_due_date=now() + timedelta(days=30),  # Add this field
        mileage_interval=5000
    )

@pytest.fixture
def api_client(client_user):
    client = APIClient()
    refresh = RefreshToken.for_user(client_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

# Unit Tests
@pytest.mark.django_db
def test_maintenance_schedule_creation(maintenance_schedule):
    assert MaintenanceSchedule.objects.count() == 1
    assert maintenance_schedule.service_type == "oil_change"

@pytest.mark.django_db
def test_maintenance_schedule_str_representation(maintenance_schedule):
    expected_str = f"Maintenance for {maintenance_schedule.vehicle.registration_number} - {maintenance_schedule.service_type}"
    assert str(maintenance_schedule) == expected_str

# Integration Tests
@pytest.mark.django_db
def test_list_maintenance_schedules(api_client, maintenance_schedule):
    url = reverse("maintenance-schedules-list")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1

@pytest.mark.django_db
def test_create_maintenance_schedule(api_client, vehicle):
    url = reverse("maintenance-schedules-list")
    data = {
        "vehicle": vehicle.id,
        "service_type": "oil_change",  # Ensure this matches one of the choices
        "recommended_date": (now() + timedelta(days=60)).strftime('%Y-%m-%d'),  # Format as YYYY-MM-DD
        "next_due_date": (now() + timedelta(days=60)).strftime('%Y-%m-%d'),  # Format as YYYY-MM-DD
        "mileage_interval": 10000
    }
    response = api_client.post(url, data, format="json")
    print(response.data)  # Log the response content for debugging
    assert response.status_code == status.HTTP_201_CREATED
    assert MaintenanceSchedule.objects.count() == 1

@pytest.mark.django_db
def test_delete_maintenance_schedule(api_client, maintenance_schedule):
    url = reverse("maintenance-schedules-detail", args=[maintenance_schedule.id])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert MaintenanceSchedule.objects.count() == 0