import os
from django.forms import ValidationError
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()
import pytest
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from appointments.models import RepairJob, Appointment
from users.models import User
from vehicles.models import Vehicle
from workshops.models import Workshop
import logging

logger = logging.getLogger(__name__)

@pytest.fixture
def client_user(db):
    return User.objects.create_user(
        username="test_client",
        email="test_client@example.com",
        password="password123"
    )

@pytest.fixture
def mechanic_user(db):
    return User.objects.create_user(
        username="test_mechanic",
        email="test_mechanic@example.com",
        password="password123"
    )

@pytest.fixture
def workshop(db):
    return Workshop.objects.create(name="Test Workshop")

@pytest.fixture
def vehicle(db, client_user):
    return Vehicle.objects.create(
        owner=client_user,
        brand="Toyota",
        model="Corolla",
        registration_number="ABC123",
        vin="1HGCM82633A123456",
        year=2020
    )

@pytest.fixture
def appointment(db, client_user, workshop, vehicle):
    return Appointment.objects.create(
        client=client_user,
        workshop=workshop,
        vehicle=vehicle,
        date="2025-05-10T10:00:00Z",
        status="confirmed",
        priority="medium",
        booking_type="standard"
    )

@pytest.fixture
def repair_job(db, appointment, mechanic_user):
    return RepairJob.objects.create(
        appointment=appointment,
        mechanic=mechanic_user,
        description="Fixing a broken screen",
        cost=100.0,
        duration=60,
        complexity_level="simple",
        warranty_period=3,
        diagnostic_notes="Screen replacement required"
    )

@pytest.fixture
def api_client(client_user):
    client = APIClient()
    refresh = RefreshToken.for_user(client_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.mark.django_db
def test_list_repair_jobs(api_client, repair_job, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing list repair jobs")
    url = reverse("repair-job-list")
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert len(response.data) == 1
    logger.info("Verified response data length: %d", len(response.data))

@pytest.mark.django_db
def test_retrieve_repair_job(api_client, repair_job, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing retrieve repair job")
    url = reverse("repair-job-detail", args=[repair_job.id])
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert response.data["id"] == repair_job.id
    logger.info("Verified response repair job ID: %d", response.data["id"])

@pytest.mark.django_db
def test_create_repair_job(api_client, appointment, mechanic_user, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing create repair job")
    url = reverse("repair-job-list")

    data = {
        "appointment_id": appointment.id,
        "mechanic_id": mechanic_user.id,
        "description": "Replace brake pads",
        "cost": 200.0,
        "duration": 120,
        "complexity_level": "moderate",
        "warranty_period": 6,
        "diagnostic_notes": "Brake pads worn out"
    }
    logger.info("Sending POST request to %s with data: %s", url, data)
    response = api_client.post(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_201_CREATED
    logger.info("Verified response status code: %d", response.status_code)

@pytest.mark.django_db
def test_update_repair_job(api_client, repair_job, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing update repair job")
    url = reverse("repair-job-detail", args=[repair_job.id])
    data = {
        "appointment_id": repair_job.appointment.id,
        "mechanic_id": repair_job.mechanic.id,
        "description": "Updated description",
        "cost": 150.0,
        "duration": 90,
        "complexity_level": "complex",
        "warranty_period": 12,
        "diagnostic_notes": "Updated diagnostic notes"
    }
    logger.info("Sending PUT request to %s with data: %s", url, data)
    response = api_client.put(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)

@pytest.mark.django_db
def test_partial_update_repair_job(api_client, repair_job, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing partial update repair job")
    url = reverse("repair-job-detail", args=[repair_job.id])
    data = {"description": "Partially updated description"}
    logger.info("Sending PATCH request to %s with data: %s", url, data)
    response = api_client.patch(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)

@pytest.mark.django_db
def test_delete_repair_job(api_client, repair_job, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing delete repair job")
    url = reverse("repair-job-detail", args=[repair_job.id])
    logger.info("Sending DELETE request to %s", url)
    response = api_client.delete(url)
    logger.info("Received response status code: %d", response.status_code)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    logger.info("Verified response status code: %d", response.status_code)
