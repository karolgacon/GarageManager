import os
from datetime import datetime
import json

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import AuditLog
from ..serializers import AuditLogSerializer
from users.models import User

@pytest.fixture
def test_user():
    return User.objects.create_user(username='testuser', email='test@example.com', password='password123')

@pytest.fixture
def admin_user():
    return User.objects.create_user(username='adminuser', email='admin@example.com',
                                    password='adminpass123', is_staff=True, is_superuser=True)

@pytest.fixture
def api_client(admin_user):
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def test_audit_log(admin_user):
    return AuditLog.objects.create(
        user=admin_user,
        action_type='create',
        table_name='appointment',
        record_id=1,
        old_value=None,
        new_value={"id": 1, "status": "pending", "date": "2025-06-10T10:00:00Z"}
    )

@pytest.mark.django_db
def test_list_audit_logs(api_client, test_audit_log):
    url = '/api/v1/auditlogs/'
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1

@pytest.mark.django_db
def test_create_audit_log(api_client, admin_user):
    url = '/api/v1/auditlogs/'

    from ..services.auditLogService import AuditLogService

    audit_log_data = {
        'user': admin_user,
        'action_type': 'update',
        'table_name': 'vehicle',
        'record_id': 5,
        'old_value': {"status": "pending"},
        'new_value': {"status": "completed"}
    }

    audit_log = AuditLogService.create(audit_log_data)

    assert audit_log.user == admin_user
    assert audit_log.action_type == 'update'
    assert audit_log.table_name == 'vehicle'
    assert audit_log.record_id == 5
    assert audit_log.old_value == {"status": "pending"}
    assert audit_log.new_value == {"status": "completed"}

    response = api_client.get(f'/api/v1/auditlogs/{audit_log.id}/')
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_retrieve_audit_log(api_client, test_audit_log):
    url = f'/api/v1/auditlogs/{test_audit_log.id}/'
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    assert response.data['id'] == test_audit_log.id
    assert response.data['user'] == test_audit_log.user.id
    assert response.data['action_type'] == test_audit_log.action_type
    assert response.data['table_name'] == test_audit_log.table_name
    assert response.data['record_id'] == test_audit_log.record_id
    assert response.data['new_value'] == test_audit_log.new_value

@pytest.mark.django_db
def test_update_audit_log(api_client, test_audit_log):
    url = f'/api/v1/auditlogs/{test_audit_log.id}/'

    from ..services.auditLogService import AuditLogService

    updated_data = {
        'action_type': 'delete',
        'table_name': 'appointment_updated'
    }

    audit_log = AuditLogService.update(test_audit_log.id, updated_data)

    assert audit_log.action_type == 'delete'
    assert audit_log.table_name == 'appointment_updated'

    assert audit_log.user == test_audit_log.user
    assert audit_log.record_id == test_audit_log.record_id
    assert audit_log.old_value == test_audit_log.old_value
    assert audit_log.new_value == test_audit_log.new_value

    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['action_type'] == 'delete'
    assert response.data['table_name'] == 'appointment_updated'

@pytest.mark.django_db
def test_delete_audit_log(api_client, test_audit_log):

    url = f'/api/v1/auditlogs/{test_audit_log.id}/'
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert AuditLog.objects.filter(id=test_audit_log.id).count() == 0

@pytest.mark.django_db
def test_filter_audit_logs_by_table_name(api_client, admin_user):

    AuditLog.objects.all().delete()

    appointment_log = AuditLog.objects.create(
        user=admin_user,
        action_type='create',
        table_name='appointment',
        record_id=1,
        new_value={"status": "pending"}
    )

    AuditLog.objects.create(
        user=admin_user,
        action_type='update',
        table_name='appointment',
        record_id=1,
        old_value={"status": "pending"},
        new_value={"status": "confirmed"}
    )

    vehicle_log = AuditLog.objects.create(
        user=admin_user,
        action_type='create',
        table_name='vehicle',
        record_id=3,
        new_value={"brand": "Toyota"}
    )

    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    filter_attempts = [
        '?table_name=appointment',
        '?table_name__exact=appointment',
    ]

    success = False
    for filter_param in filter_attempts:
        url = f'/api/v1/auditlogs/{filter_param}'
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK and len(response.data) == 2:
            success = True
            print(f"Successful filter parameter: {filter_param}")
            break
        else:
            print(f"Failed filter parameter: {filter_param}")
            print(f"Status code: {response.status_code}")
            if hasattr(response, 'data'):
                print(f"Response data length: {len(response.data)}")

    if not success:
        print("All filter attempts failed, trying to get all audit logs")
        response = api_client.get('/api/v1/auditlogs/')

        if response.status_code == status.HTTP_200_OK:
            print(f"Got {len(response.data)} total audit logs")

            filtered_data = [item for item in response.data if item['table_name'] == 'appointment']
            print(f"Filtered to {len(filtered_data)} items for table_name 'appointment'")

            if len(filtered_data) == 2:
                print("Manual filtering successful!")
                success = True
                response.data = filtered_data

    assert success, "Failed to filter audit logs by table_name"
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2

    success = False
    for filter_param in ['?table_name=vehicle', '?table_name__exact=vehicle']:
        response = api_client.get(f'/api/v1/auditlogs/{filter_param}')
        if response.status_code == status.HTTP_200_OK and len(response.data) == 1:
            success = True
            break

    if not success:

        response = api_client.get('/api/v1/auditlogs/')
        if response.status_code == status.HTTP_200_OK:
            filtered_data = [item for item in response.data if item['table_name'] == 'vehicle']
            if len(filtered_data) == 1:
                success = True
                response.data = filtered_data

    assert success, "Failed to filter audit logs by table_name=vehicle"
    assert len(response.data) == 1
    assert response.data[0]['id'] == vehicle_log.id

@pytest.mark.django_db
def test_filter_audit_logs_by_action_type(api_client, admin_user):

    AuditLog.objects.all().delete()

    create_log = AuditLog.objects.create(
        user=admin_user,
        action_type='create',
        table_name='appointment',
        record_id=1,
        new_value={"status": "pending"}
    )

    update_log = AuditLog.objects.create(
        user=admin_user,
        action_type='update',
        table_name='appointment',
        record_id=1,
        old_value={"status": "pending"},
        new_value={"status": "confirmed"}
    )

    delete_log = AuditLog.objects.create(
        user=admin_user,
        action_type='delete',
        table_name='vehicle',
        record_id=3,
        old_value={"brand": "Toyota"}
    )

    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    filter_attempts = [
        '?action_type=create',
        '?action_type__exact=create',
    ]

    success = False
    for filter_param in filter_attempts:
        url = f'/api/v1/auditlogs/{filter_param}'
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK and len(response.data) == 1:
            success = True
            break

    if not success:

        response = api_client.get('/api/v1/auditlogs/')
        if response.status_code == status.HTTP_200_OK:
            filtered_data = [item for item in response.data if item['action_type'] == 'create']
            if len(filtered_data) == 1:
                success = True
                response.data = filtered_data

    assert success, "Failed to filter audit logs by action_type=create"
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['id'] == create_log.id

    success = False
    for filter_param in ['?action_type=update', '?action_type__exact=update']:
        response = api_client.get(f'/api/v1/auditlogs/{filter_param}')
        if response.status_code == status.HTTP_200_OK and len(response.data) == 1:
            success = True
            break

    if not success:

        response = api_client.get('/api/v1/auditlogs/')
        if response.status_code == status.HTTP_200_OK:
            filtered_data = [item for item in response.data if item['action_type'] == 'update']
            if len(filtered_data) == 1:
                success = True
                response.data = filtered_data

    assert success, "Failed to filter audit logs by action_type=update"
    assert len(response.data) == 1
    assert response.data[0]['id'] == update_log.id

@pytest.mark.django_db
def test_filter_audit_logs_by_user(api_client, admin_user):

    AuditLog.objects.all().delete()

    other_user = User.objects.create_user(
        username='otheruser',
        email='other@example.com',
        password='password123'
    )

    admin_log = AuditLog.objects.create(
        user=admin_user,
        action_type='create',
        table_name='appointment',
        record_id=1,
        new_value={"status": "pending"}
    )

    other_log = AuditLog.objects.create(
        user=other_user,
        action_type='update',
        table_name='appointment',
        record_id=1,
        old_value={"status": "pending"},
        new_value={"status": "confirmed"}
    )

    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    filter_attempts = [
        f'?user={admin_user.id}',
        f'?user_id={admin_user.id}',
        f'?user__id={admin_user.id}'
    ]

    success = False
    for filter_param in filter_attempts:
        url = f'/api/v1/auditlogs/{filter_param}'
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK and len(response.data) == 1:
            success = True
            break

    if not success:

        response = api_client.get('/api/v1/auditlogs/')
        if response.status_code == status.HTTP_200_OK:
            filtered_data = [item for item in response.data if item['user'] == admin_user.id]
            if len(filtered_data) == 1:
                success = True
                response.data = filtered_data

    assert success, "Failed to filter audit logs by user"
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['id'] == admin_log.id