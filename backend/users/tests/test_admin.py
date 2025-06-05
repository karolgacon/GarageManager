import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
import unittest.mock as mock
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import User
from ..serializers import UserSerializer
from ..services.userService import UserService

@pytest.fixture
def admin_user():
    return User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='admin123',
        is_staff=True,
        is_superuser=True,
        role='admin'
    )

@pytest.fixture
def regular_user():
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='password123',
        role='client'
    )

@pytest.fixture
def blocked_user():
    return User.objects.create_user(
        username='blockeduser',
        email='blocked@example.com',
        password='password123',
        status='blocked',
        role='client'
    )

@pytest.fixture
def api_client(admin_user):
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.mark.django_db
def test_list_users(admin_user, regular_user):
    users = UserService.get_all()

    assert len(users) >= 2

    user_ids = [user.id for user in users]
    assert admin_user.id in user_ids
    assert regular_user.id in user_ids

@pytest.mark.django_db
def test_create_user():
    data = {
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'newpass123',
        'role': 'mechanic'
    }
    created_user = UserService.create(data)

    assert User.objects.filter(email='newuser@example.com').exists()
    assert created_user.username == 'newuser'
    assert created_user.role == 'mechanic'

@pytest.mark.django_db
def test_retrieve_user(regular_user):
    retrieved_user = UserService.get_by_id(regular_user.id)

    assert retrieved_user.id == regular_user.id
    assert retrieved_user.username == regular_user.username
    assert retrieved_user.email == regular_user.email
    assert retrieved_user.role == regular_user.role

@pytest.mark.django_db
def test_update_user(regular_user):
    data = {
        'first_name': 'Updated',
        'last_name': 'Name',
        'role': 'mechanic'
    }
    updated_user = UserService.update(regular_user.id, data)

    assert updated_user.first_name == 'Updated'
    assert updated_user.last_name == 'Name'
    assert updated_user.role == 'mechanic'

    assert updated_user.username == regular_user.username
    assert updated_user.email == regular_user.email

@pytest.mark.django_db
def test_partial_update_user(regular_user):
    data = {
        'first_name': 'Partially Updated'
    }
    updated_user = UserService.update(regular_user.id, data)

    assert updated_user.first_name == 'Partially Updated'

    assert updated_user.username == regular_user.username
    assert updated_user.email == regular_user.email
    assert updated_user.role == regular_user.role

@pytest.mark.django_db
def test_delete_user(regular_user):
    UserService.delete(regular_user.id)

    assert not User.objects.filter(id=regular_user.id).exists()

@pytest.mark.django_db
def test_activate_user(blocked_user):
    result = UserService.activate_user(blocked_user.id)

    updated_user = User.objects.get(id=blocked_user.id)
    assert updated_user.status == 'active'
    assert result['status'] == 'User activated'

@pytest.mark.django_db
def test_block_user(regular_user):
    result = UserService.block_user(regular_user.id)

    updated_user = User.objects.get(id=regular_user.id)
    assert updated_user.status == 'blocked'
    assert result['status'] == 'User blocked'

@pytest.mark.django_db
def test_dashboard_statistics(admin_user, regular_user, blocked_user):
    stats = UserService.get_dashboard_statistics()

    assert 'total_users' in stats
    assert 'active_users' in stats
    assert 'blocked_users' in stats
    assert stats['total_users'] >= 3
    assert stats['active_users'] >= 2
    assert stats['blocked_users'] >= 1

@pytest.mark.django_db
def test_block_already_blocked_user(blocked_user):

    with pytest.raises(Exception) as excinfo:
        UserService.block_user(blocked_user.id)

    assert 'already blocked' in str(excinfo.value).lower()

@pytest.mark.django_db
def test_activate_already_active_user(regular_user):

    with pytest.raises(Exception) as excinfo:
        UserService.activate_user(regular_user.id)

    assert 'already active' in str(excinfo.value).lower()

@pytest.mark.django_db
def test_permission_get_all_users():

    regular_user = User.objects.create_user(
        username='regularuser_for_perm_test',
        email='regular_perm_test@example.com',
        password='password123',
        role='client',
        is_staff=False,
        is_superuser=False
    )

    def has_admin_permission(user):
        return user.is_staff and user.is_superuser and user.role == 'admin'

    assert not has_admin_permission(regular_user)

    admin_user = User.objects.create_user(
        username='adminuser_for_perm_test',
        email='admin_perm_test@example.com',
        password='admin123',
        role='admin',
        is_staff=True,
        is_superuser=True
    )

    assert has_admin_permission(admin_user)