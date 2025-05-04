import pytest
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from appointments.models import CustomerFeedback, RepairJob, Appointment
from users.models import User
from vehicles.models import Vehicle
from workshops.models import Workshop  # Import added here
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Fixtures
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
        client=client_user,
        brand="Toyota",
        model="Corolla",
        registration_number="ABC123",
        vin="1HGCM82633A123456",
        manufacture_year=2020
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
def feedback(db, client_user, repair_job):
    return CustomerFeedback.objects.create(
        repair_job=repair_job,
        client=client_user,
        rating=5,
        review_text="Great service!",
        service_quality=5,
        punctuality_rating=4,
        would_recommend=True,
        tags="professional, fast"
    )


@pytest.fixture
def api_client(client_user):
    client = APIClient()
    refresh = RefreshToken.for_user(client_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


# Unit Tests
@pytest.mark.django_db
def test_list_feedback(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing list feedback")
    url = reverse("customer-feedback-list")  # Updated URL name
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert len(response.data) == 1
    logger.info("Verified response data length: %d", len(response.data))


@pytest.mark.django_db
def test_retrieve_feedback(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing retrieve feedback")
    url = reverse("customer-feedback-detail", args=[feedback.id])  # Updated URL name
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert response.data["id"] == feedback.id
    logger.info("Verified response feedback ID: %d", response.data["id"])


@pytest.mark.django_db
def test_create_feedback(api_client, client_user, repair_job, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing create feedback")
    url = reverse("customer-feedback-list")  # Updated URL name
    data = {
        "repair_job": repair_job.id,
        "client": client_user.id,
        "rating": 5,
        "review_text": "Excellent service!",
        "service_quality": 5,
        "punctuality_rating": 5,
        "would_recommend": True,
        "tags": "excellent, professional"
    }
    logger.info("Sending POST request to %s with data: %s", url, data)
    response = api_client.post(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_201_CREATED
    logger.info("Verified response status code: %d", response.status_code)


@pytest.mark.django_db
def test_update_feedback(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing update feedback")
    url = reverse("customer-feedback-detail", args=[feedback.id])  # Updated URL name
    data = {
        "repair_job": feedback.repair_job.id,  # Include required field
        "client": client_user.id,  # Include required field
        "rating": 4,
        "review_text": "Good service, but could be faster.",
        "service_quality": 5,  # Include required field
        "punctuality_rating": 4,  # Include required field
        "would_recommend": True,  # Include optional field
        "tags": "updated, fast"  # Include optional field
    }
    logger.info("Sending PUT request to %s with data: %s", url, data)
    response = api_client.put(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)


@pytest.mark.django_db
def test_partial_update_feedback(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing partial update feedback")
    url = reverse("customer-feedback-detail", args=[feedback.id])  # Updated URL name
    data = {"review_text": "Updated review text."}
    logger.info("Sending PATCH request to %s with data: %s", url, data)
    response = api_client.patch(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)


@pytest.mark.django_db
def test_delete_feedback(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing delete feedback")
    url = reverse("customer-feedback-detail", args=[feedback.id])  # Updated URL name
    logger.info("Sending DELETE request to %s", url)
    response = api_client.delete(url)
    logger.info("Received response status code: %d", response.status_code)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    logger.info("Verified response status code: %d", response.status_code)


# Custom Actions
@pytest.mark.django_db
def test_feedback_by_rating(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing feedback by rating")
    url = reverse("customer-feedback-by-rating") + "?min_rating=4"  # Updated URL name
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)


@pytest.mark.django_db
def test_add_workshop_response(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing add workshop response")
    url = reverse("customer-feedback-add-workshop-response", args=[feedback.id])  # Updated URL name
    data = {"response_from_workshop": "Thank you for your feedback!"}
    logger.info("Sending POST request to %s with data: %s", url, data)
    response = api_client.post(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)


@pytest.mark.django_db
def test_feedback_recommended(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing feedback recommended")
    url = reverse("customer-feedback-recommended")  # Updated URL name
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)


@pytest.mark.django_db
def test_feedback_by_tag(api_client, client_user, feedback, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing feedback by tag")
    url = reverse("customer-feedback-by-tag") + "?tag=professional"  # Updated URL name
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)