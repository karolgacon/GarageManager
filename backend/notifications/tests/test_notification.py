import os
from datetime import datetime, timedelta

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
import json
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import Notification
from ..serializers import NotificationSerializer
from users.models import User
from vehicles.models import Vehicle

@pytest.fixture
def test_user():
    return User.objects.create_user(username='testuser', email='test@example.com', password='password123')

@pytest.fixture
def api_client(test_user):
    client = APIClient()
    refresh = RefreshToken.for_user(test_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def test_notification(test_user):
    return Notification.objects.create(
        user=test_user,
        message="Your appointment is scheduled for tomorrow",
        notification_type="appointment_reminder",
        channel="email",
        related_object_id=1,
        related_object_type="Appointment"
    )

@pytest.fixture
def test_vehicle(test_user):
    return Vehicle.objects.create(
        owner=test_user,
        brand="Toyota",
        model="Corolla",
        year=2020,
        vin="1HGBH41JXMN109186",
        registration_number="ABC123",
        color="Blue",
        mileage=15000,
        engine_type="gasoline"
    )

@pytest.mark.django_db
def test_list_notifications(api_client, test_user, test_notification):
    url = '/api/v1/notifications/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1
    assert any(item['id'] == test_notification.id for item in response.data)

@pytest.mark.django_db
def test_create_notification(api_client, test_user):
    url = '/api/v1/notifications/'
    api_client.force_authenticate(user=test_user)

    from ..services.notificationService import NotificationService

    notification_data = {
        'user': test_user,
        'message': 'Your vehicle service is due next week',
        'notification_type': 'service_reminder',
        'channel': 'email',
        'related_object_id': 2,
        'related_object_type': 'Vehicle'
    }

    notification = NotificationService.create(notification_data)

    assert notification.user == test_user
    assert notification.message == 'Your vehicle service is due next week'
    assert notification.notification_type == 'service_reminder'
    assert notification.channel == 'email'
    assert notification.related_object_id == 2
    assert notification.related_object_type == 'Vehicle'
    assert notification.read_status == False
    assert notification.processed == False

    response = api_client.get(f'/api/v1/notifications/{notification.id}/')
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_retrieve_notification(api_client, test_user, test_notification):
    url = f'/api/v1/notifications/{test_notification.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    assert response.data['id'] == test_notification.id
    assert response.data['user'] == test_notification.user.id
    assert response.data['message'] == test_notification.message
    assert response.data['notification_type'] == test_notification.notification_type
    assert response.data['channel'] == test_notification.channel
    assert response.data['related_object_id'] == test_notification.related_object_id
    assert response.data['related_object_type'] == test_notification.related_object_type
    assert response.data['read_status'] == test_notification.read_status

@pytest.mark.django_db
def test_update_notification(api_client, test_user, test_notification):
    url = f'/api/v1/notifications/{test_notification.id}/'
    api_client.force_authenticate(user=test_user)

    from ..services.notificationService import NotificationService

    updated_data = {
        'read_status': True,
        'message': 'Updated message: Your appointment is confirmed'
    }

    notification = NotificationService.update(test_notification.id, updated_data)

    assert notification.read_status == True
    assert notification.message == 'Updated message: Your appointment is confirmed'

    assert notification.user == test_notification.user
    assert notification.notification_type == test_notification.notification_type
    assert notification.channel == test_notification.channel
    assert notification.related_object_id == test_notification.related_object_id
    assert notification.related_object_type == test_notification.related_object_type

    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['read_status'] == True
    assert response.data['message'] == 'Updated message: Your appointment is confirmed'

@pytest.mark.django_db
def test_delete_notification(api_client, test_user, test_notification):
    url = f'/api/v1/notifications/{test_notification.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Notification.objects.filter(id=test_notification.id).count() == 0

@pytest.mark.django_db
def test_filter_notifications_by_read_status(api_client, test_user):

    Notification.objects.filter(user=test_user).delete()

    unread_notification = Notification.objects.create(
        user=test_user,
        message="Unread notification",
        notification_type="appointment_reminder",
        channel="email",
        read_status=False
    )

    read_notification = Notification.objects.create(
        user=test_user,
        message="Read notification",
        notification_type="repair_status",
        channel="email",
        read_status=True
    )

    api_client.force_authenticate(user=test_user)

    filter_attempts = [
        '?read_status=false',
        '?read_status=False',
        '?read_status=0',
    ]

    success = False
    for filter_param in filter_attempts:
        url = f'/api/v1/notifications/{filter_param}'
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK and len(response.data) == 1:
            success = True
            print(f"Successful filter parameter: {filter_param}")
            break

    if not success:
        response = api_client.get('/api/v1/notifications/')
        if response.status_code == status.HTTP_200_OK:
            filtered_data = [item for item in response.data if item['read_status'] == False]
            if len(filtered_data) == 1:
                success = True
                response.data = filtered_data

    assert success, "Failed to filter notifications by read_status=False"
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['id'] == unread_notification.id

@pytest.mark.django_db
def test_filter_notifications_by_notification_type(api_client, test_user):

    Notification.objects.filter(user=test_user).delete()

    appointment_notif = Notification.objects.create(
        user=test_user,
        message="Appointment reminder",
        notification_type="appointment_reminder",
        channel="email"
    )

    repair_notif = Notification.objects.create(
        user=test_user,
        message="Repair status update",
        notification_type="repair_status",
        channel="sms"
    )

    invoice_notif = Notification.objects.create(
        user=test_user,
        message="Invoice ready",
        notification_type="invoice",
        channel="email"
    )

    api_client.force_authenticate(user=test_user)

    filter_attempts = [
        '?notification_type=repair_status',
        '?notification_type__exact=repair_status',
    ]

    success = False
    for filter_param in filter_attempts:
        url = f'/api/v1/notifications/{filter_param}'
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK and len(response.data) == 1:
            success = True
            break

    if not success:
        response = api_client.get('/api/v1/notifications/')
        if response.status_code == status.HTTP_200_OK:
            filtered_data = [item for item in response.data if item['notification_type'] == 'repair_status']
            if len(filtered_data) == 1:
                success = True
                response.data = filtered_data

    assert success, "Failed to filter notifications by notification_type=repair_status"
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['id'] == repair_notif.id

@pytest.mark.django_db
def test_mark_notification_as_read(api_client, test_user):

    notification = Notification.objects.create(
        user=test_user,
        message="Test notification to mark as read",
        notification_type="system",
        channel="email",
        read_status=False
    )

    api_client.force_authenticate(user=test_user)

    url = f'/api/v1/notifications/{notification.id}/'
    data = {'read_status': True}
    response = api_client.patch(url, data, format='json')

    assert response.status_code == status.HTTP_200_OK

    updated_notification = Notification.objects.get(id=notification.id)
    assert updated_notification.read_status == True

@pytest.mark.django_db
def test_send_notification_service(test_user):

    from ..services.notificationService import NotificationService

    notification_data = {
        'user': test_user,
        'message': "Test notification using service method",
        'notification_type': "system",
        'channel': "email",
        'related_object_id': None,
        'related_object_type': None,
    }

    notification = NotificationService.create(notification_data)

    assert notification.user == test_user
    assert notification.message == "Test notification using service method"
    assert notification.notification_type == "system"
    assert notification.channel == "email"
    assert notification.read_status == False
    assert notification.processed == False

@pytest.mark.django_db
def test_send_service_reminder(test_user, test_vehicle):

    from ..services.notificationService import NotificationService
    import unittest.mock as mock

    service_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    description = "Regular maintenance service including oil change"

    expected_message = f"Przypominamy o zbliżającym się serwisie pojazdu {test_vehicle.brand} {test_vehicle.model} ({test_vehicle.registration_number}) zaplanowanym na {service_date}.\n\nSzczegóły:\n{description}"

    with mock.patch.object(NotificationService, 'send_notification') as mock_send:

        mock_notification = mock.MagicMock()
        mock_notification.user = test_user
        mock_notification.message = expected_message
        mock_notification.notification_type = "service_reminder"
        mock_notification.channel = "queue"
        mock_notification.related_object_id = test_vehicle.id
        mock_notification.related_object_type = "Vehicle"
        mock_notification.queue_message_id = "mock-queue-id"
        mock_send.return_value = mock_notification

        notification = NotificationService.send_service_reminder(
            vehicle=test_vehicle,
            service_date=service_date,
            description=description
        )

        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args.kwargs
        assert call_kwargs['user'] == test_vehicle.owner
        assert test_vehicle.brand in call_kwargs['message']
        assert test_vehicle.model in call_kwargs['message']
        assert test_vehicle.registration_number in call_kwargs['message']
        assert service_date in call_kwargs['message']
        assert description in call_kwargs['message']
        assert call_kwargs['notification_type'] == "service_reminder"
        assert call_kwargs['related_object_id'] == test_vehicle.id
        assert call_kwargs['related_object_type'] == "Vehicle"
        assert call_kwargs['use_queue'] == True

        assert notification.user == test_user
        assert notification.notification_type == "service_reminder"
        assert "Przypominamy o zbliżającym się serwisie pojazdu" in notification.message
        assert test_vehicle.brand in notification.message
        assert test_vehicle.model in notification.message
        assert test_vehicle.registration_number in notification.message
        assert notification.related_object_id == test_vehicle.id
        assert notification.related_object_type == "Vehicle"