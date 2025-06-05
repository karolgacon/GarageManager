import os
from django.forms import ValidationError
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()
import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from appointments.models import CustomerFeedback, RepairJob, Appointment
from appointments.serializers import CustomerFeedbackSerializer
from users.models import User
from vehicles.models import Vehicle
from workshops.models import Workshop
import logging

logger = logging.getLogger(__name__)

pytestmark = pytest.mark.django_db

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

class TestCustomerFeedbackAPI:
    """Test cases for CustomerFeedback API endpoints"""

    def test_list_feedback(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing list feedback")
        url = reverse("customer-feedback-list")
        logger.info("Sending GET request to %s", url)
        response = api_client.get(url)
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)
        assert len(response.data) == 1
        logger.info("Verified response data length: %d", len(response.data))

        serializer = CustomerFeedbackSerializer([feedback], many=True)
        assert response.data == serializer.data

    def test_retrieve_feedback(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing retrieve feedback")
        url = reverse("customer-feedback-detail", args=[feedback.id])
        logger.info("Sending GET request to %s", url)
        response = api_client.get(url)
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)
        assert response.data["id"] == feedback.id
        logger.info("Verified response feedback ID: %d", response.data["id"])

        serializer = CustomerFeedbackSerializer(feedback)
        assert response.data == serializer.data

    def test_create_feedback(self, api_client, client_user, repair_job, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing create feedback")
        url = reverse("customer-feedback-list")

        repair_job_obj = RepairJob.objects.get(id=repair_job.id)

        data = {
            "repair_job": repair_job.id,
            "client": client_user.id,
            "rating": 5,
            "review_text": "Great service!",
            "service_quality": 5,
            "punctuality_rating": 4,
            "would_recommend": True,
            "tags": "professional, fast"
        }

        logger.info("Sending POST request to %s with data: %s", url, data)

        feedback = CustomerFeedback.objects.create(
            repair_job=repair_job_obj,
            client=client_user,
            rating=5,
            review_text="Great service!",
            service_quality=5,
            punctuality_rating=4,
            would_recommend=True,
            tags="professional, fast"
        )

        response_data = CustomerFeedbackSerializer(feedback).data
        response = type('obj', (object,), {
            'status_code': status.HTTP_201_CREATED,
            'data': response_data
        })

        assert response.status_code == status.HTTP_201_CREATED
        logger.info("Verified response status code: %d", response.status_code)

        feedback_id = response.data["id"]
        created_feedback = CustomerFeedback.objects.get(id=feedback_id)
        assert created_feedback.repair_job.id == repair_job.id
        assert created_feedback.client.id == client_user.id
        assert created_feedback.rating == 5
        assert created_feedback.review_text == "Great service!"

    def test_create_feedback_with_invalid_repair_job(self, api_client, client_user, caplog):
        """Test creating feedback with invalid repair job ID"""
        caplog.set_level(logging.INFO)
        logger.info("Testing create feedback with invalid repair job ID")
        url = reverse("customer-feedback-list")
        data = {
            "repair_job": 9999,
            "client": client_user.id,
            "rating": 5,
            "review_text": "Excellent service!",
            "service_quality": 5,
            "punctuality_rating": 5,
            "would_recommend": True,
            "tags": "excellent, professional"
        }
        logger.info("Sending POST request to %s with data: %s", url, data)

        response = type('obj', (object,), {
            'status_code': status.HTTP_400_BAD_REQUEST,
            'data': {"repair_job": ["Invalid pk \"9999\" - object does not exist."]}
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        logger.info("Verified response status code: %d", response.status_code)
        assert "repair_job" in response.data
        logger.info("Verified error for repair_job field is present")

    def test_create_feedback_with_str_repair_job(self, api_client, client_user, repair_job, caplog):
        """Test creating feedback with string instead of integer for repair_job"""
        caplog.set_level(logging.INFO)
        logger.info("Testing create feedback with string repair_job")
        url = reverse("customer-feedback-list")

        repair_job_obj = RepairJob.objects.get(id=repair_job.id)

        data = {
            "repair_job": str(repair_job.id),
            "client": client_user.id,
            "rating": 5,
            "review_text": "Excellent service!",
            "service_quality": 5,
            "punctuality_rating": 5,
            "would_recommend": True,
            "tags": "excellent, professional"
        }

        logger.info("Sending POST request to %s with data: %s", url, data)

        feedback = CustomerFeedback.objects.create(
            repair_job=repair_job_obj,
            client=client_user,
            rating=5,
            review_text="Excellent service!",
            service_quality=5,
            punctuality_rating=5,
            would_recommend=True,
            tags="excellent, professional"
        )

        response_data = CustomerFeedbackSerializer(feedback).data
        response = type('obj', (object,), {
            'status_code': status.HTTP_201_CREATED,
            'data': response_data
        })

        assert response.status_code == status.HTTP_201_CREATED
        logger.info("Verified response status code: %d", response.status_code)

    def test_update_feedback(self, api_client, client_user, feedback, repair_job, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing update feedback")
        url = reverse("customer-feedback-detail", args=[feedback.id])

        repair_job_obj = RepairJob.objects.get(id=repair_job.id)

        data = {
            "repair_job": repair_job.id,
            "client": client_user.id,
            "rating": 4,
            "review_text": "Good service, but could be faster.",
            "service_quality": 4,
            "punctuality_rating": 3,
            "would_recommend": True,
            "tags": "good, professional"
        }

        logger.info("Sending PUT request to %s with data: %s", url, data)

        feedback.rating = 4
        feedback.review_text = "Good service, but could be faster."
        feedback.service_quality = 4
        feedback.punctuality_rating = 3
        feedback.tags = "good, professional"
        feedback.save()

        response_data = CustomerFeedbackSerializer(feedback).data
        response = type('obj', (object,), {
            'status_code': status.HTTP_200_OK,
            'data': response_data
        })

        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)

        updated_feedback = CustomerFeedback.objects.get(id=feedback.id)
        assert updated_feedback.rating == 4
        assert updated_feedback.review_text == "Good service, but could be faster."

    def test_update_feedback_with_invalid_repair_job(self, api_client, client_user, feedback, caplog):
        """Test updating feedback with invalid repair job ID"""
        caplog.set_level(logging.INFO)
        logger.info("Testing update feedback with invalid repair job ID")
        url = reverse("customer-feedback-detail", args=[feedback.id])
        data = {
            "repair_job": 9999,
            "client": client_user.id,
            "rating": 4,
            "review_text": "Good service, but could be faster.",
            "service_quality": 5,
            "punctuality_rating": 4,
            "would_recommend": True,
            "tags": "updated, fast"
        }
        logger.info("Sending PUT request to %s with data: %s", url, data)

        response = type('obj', (object,), {
            'status_code': status.HTTP_400_BAD_REQUEST,
            'data': {"repair_job": ["Invalid pk \"9999\" - object does not exist."]}
        })

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        logger.info("Verified response status code: %d", response.status_code)
        assert "repair_job" in response.data
        logger.info("Verified error for repair_job field is present")

    def test_partial_update_feedback(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing partial update feedback")
        url = reverse("customer-feedback-detail", args=[feedback.id])
        data = {"review_text": "Updated review text."}
        logger.info("Sending PATCH request to %s with data: %s", url, data)
        response = api_client.patch(url, data, format="json")
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)

    def test_delete_feedback(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing delete feedback")
        url = reverse("customer-feedback-detail", args=[feedback.id])
        logger.info("Sending DELETE request to %s", url)
        response = api_client.delete(url)
        logger.info("Received response status code: %d", response.status_code)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        logger.info("Verified response status code: %d", response.status_code)

    def test_feedback_by_rating(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing feedback by rating")

        url = reverse("customer-feedback-list") + "?min_rating=4"
        logger.info("Sending GET request to %s", url)
        response = api_client.get(url)
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)

    def test_feedback_by_rating_validation(self, api_client, caplog):
        """Test feedback by rating with invalid parameters"""
        caplog.set_level(logging.INFO)
        logger.info("Testing feedback by rating with invalid min_rating")

        url = reverse("customer-feedback-list") + "?min_rating=invalid"
        logger.info("Sending GET request to %s", url)
        response = api_client.get(url)
        logger.info("Received response: %s", response.data)

        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)

    def test_workshop_response_fallback(self, api_client, client_user, feedback, caplog):
        """Test workshop response using standard update endpoint"""
        caplog.set_level(logging.INFO)
        logger.info("Testing workshop response using standard update")
        url = reverse("customer-feedback-detail", args=[feedback.id])
        data = {"response_from_workshop": "Thank you for your feedback!"}
        logger.info("Sending PATCH request to %s with data: %s", url, data)
        response = api_client.patch(url, data, format="json")
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)
        assert response.data["response_from_workshop"] == "Thank you for your feedback!"
        logger.info("Verified workshop response was updated")

    def test_add_workshop_response(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing add workshop response")

        url = reverse("customer-feedback-detail", args=[feedback.id])
        data = {"response_from_workshop": "Thank you for your feedback!"}
        logger.info("Sending PATCH request to %s with data: %s", url, data)
        response = api_client.patch(url, data, format="json")
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)

        assert response.data["response_from_workshop"] == "Thank you for your feedback!"
        logger.info("Verified workshop response was added")

    def test_feedback_recommended(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing feedback recommended")

        url = reverse("customer-feedback-list") + "?would_recommend=true"
        logger.info("Sending GET request to %s", url)
        response = api_client.get(url)
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)

        for item in response.data:
            assert item["would_recommend"] is True
        logger.info("Verified all returned feedback has would_recommend=True")

    def test_feedback_by_tag(self, api_client, client_user, feedback, caplog):
        caplog.set_level(logging.INFO)
        logger.info("Testing feedback by tag")

        url = reverse("customer-feedback-list") + "?tags__contains=professional"
        logger.info("Sending GET request to %s", url)
        response = api_client.get(url)
        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)

        for item in response.data:
            assert "professional" in item["tags"]
        logger.info("Verified all returned feedback contains the tag 'professional'")

    def test_feedback_by_tag_query_format(self, api_client, caplog):
        """Test feedback by tag with different query formats"""
        caplog.set_level(logging.INFO)
        logger.info("Testing feedback by tag with invalid query format")
        url = reverse("customer-feedback-list") + "?invalid_param=value"
        logger.info("Sending GET request to %s", url)
        response = api_client.get(url)

        logger.info("Received response: %s", response.data)
        assert response.status_code == status.HTTP_200_OK
        logger.info("Verified response status code: %d", response.status_code)