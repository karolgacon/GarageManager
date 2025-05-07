import pytest
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from vehicles.models import Vehicle
from users.models import User
from vehicles.models import Diagnostics
from django.urls import reverse

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
def diagnostic(db, vehicle):
    return Diagnostics.objects.create(
        vehicle=vehicle,
        diagnostic_notes="Engine issue",
        estimated_repair_cost=500.00,
        severity_level="high"
    )

@pytest.fixture
def api_client(client_user):
    client = APIClient()
    refresh = RefreshToken.for_user(client_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

# Unit Tests
@pytest.mark.django_db
def test_diagnostic_creation(diagnostic):
    assert Diagnostics.objects.count() == 1
    assert diagnostic.severity_level == "high"

@pytest.mark.django_db
def test_diagnostic_str_representation(diagnostic):
    expected_str = f"Diagnostic {diagnostic.vehicle.registration_number} - {diagnostic.diagnostic_date}"
    assert str(diagnostic) == expected_str

# Integration Tests
@pytest.mark.django_db
def test_list_diagnostics(api_client, diagnostic):
    url = reverse("diagnostics-list")
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1

@pytest.mark.django_db
def test_create_diagnostic(api_client, vehicle):
    url = reverse("diagnostics-list")
    data = {
        "vehicle": vehicle.id,
        "diagnostic_notes": "Brake issue",
        "estimated_repair_cost": 300.00,
        "severity_level": "medium"
    }
    response = api_client.post(url, data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert Diagnostics.objects.count() == 1

@pytest.mark.django_db
def test_delete_diagnostic(api_client, diagnostic):
    url = reverse("diagnostics-detail", args=[diagnostic.id])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Diagnostics.objects.count() == 0