import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import datetime

from ..models import User, Profile, LoginHistory, LoyaltyPoints

User = get_user_model()

@pytest.fixture
def admin_user():
    """Fixture tworzący użytkownika administratora"""
    return User.objects.create_user(
        username='testadmin',
        email='admin@example.com',
        password='admin123',
        role='admin',
        is_staff=True,
        is_superuser=True
    )

@pytest.fixture
def owner_user():
    """Fixture tworzący użytkownika właściciela"""
    return User.objects.create_user(
        username='testowner',
        email='owner@example.com',
        password='owner123',
        role='owner'
    )

@pytest.fixture
def mechanic_user():
    """Fixture tworzący użytkownika mechanika"""
    return User.objects.create_user(
        username='testmechanic',
        email='mechanic@example.com',
        password='mechanic123',
        role='mechanic'
    )

@pytest.fixture
def regular_user():
    """Fixture tworzący zwykłego użytkownika (klienta)"""
    user = User.objects.create_user(
        username='testclient',
        email='client@example.com',
        password='client123',
        role='client'
    )

    Profile.objects.create(
        user=user,
        address='ul. Testowa 1',
        phone='+48 500 100 200',
        preferred_contact_method='email'
    )
    return user

@pytest.fixture
def admin_api_client(admin_user):
    """Fixture tworzący klienta API z uprawnieniami administratora"""
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def owner_api_client(owner_user):
    """Fixture tworzący klienta API z uprawnieniami właściciela"""
    client = APIClient()
    refresh = RefreshToken.for_user(owner_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def mechanic_api_client(mechanic_user):
    """Fixture tworzący klienta API z uprawnieniami mechanika"""
    client = APIClient()
    refresh = RefreshToken.for_user(mechanic_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def regular_api_client(regular_user):
    """Fixture tworzący klienta API ze zwykłymi uprawnieniami (klient)"""
    client = APIClient()
    refresh = RefreshToken.for_user(regular_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.mark.django_db
class TestUserModel:
    """Testy dla modelu User"""

    def test_create_user(self):
        """Test tworzenia zwykłego użytkownika"""
        user = User.objects.create_user(
            username='newuser',
            email='newuser@example.com',
            password='newuser123',
            role='client'
        )

        assert user.email == 'newuser@example.com'
        assert user.username == 'newuser'
        assert user.role == 'client'
        assert user.status == 'active'
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.check_password('newuser123')

    def test_create_superuser(self):
        """Test tworzenia superużytkownika"""
        superuser = User.objects.create_superuser(
            username='newadmin',
            email='newadmin@example.com',
            password='newadmin123',
            role='admin'
        )

        assert superuser.email == 'newadmin@example.com'
        assert superuser.username == 'newadmin'
        assert superuser.role == 'admin'
        assert superuser.is_active is True
        assert superuser.is_staff is True
        assert superuser.is_superuser is True
        assert superuser.check_password('newadmin123')

    def test_user_str_method(self, regular_user):
        """Test metody __str__ modelu User"""
        assert str(regular_user) == regular_user.email

    def test_user_status_choices(self):
        """Test wyborów statusu użytkownika"""
        user = User.objects.create_user(
            username='statususer',
            email='statususer@example.com',
            password='status123',
            status='blocked'
        )

        assert user.status == 'blocked'

        user.status = 'suspended'
        user.save()

        updated_user = User.objects.get(id=user.id)
        assert updated_user.status == 'suspended'

    def test_user_role_choices(self):
        """Test wyborów roli użytkownika"""
        user = User.objects.create_user(
            username='roleuser',
            email='roleuser@example.com',
            password='role123',
            role='mechanic'
        )

        assert user.role == 'mechanic'

        user.role = 'client'
        user.save()

        updated_user = User.objects.get(id=user.id)
        assert updated_user.role == 'client'

    def test_login_attempts(self):
        """Test licznika prób logowania"""
        user = User.objects.create_user(
            username='loginuser',
            email='loginuser@example.com',
            password='login123'
        )

        assert user.login_attempts == 0

        user.login_attempts += 1
        user.save()

        updated_user = User.objects.get(id=user.id)
        assert updated_user.login_attempts == 1

@pytest.mark.django_db
class TestLoginHistoryModel:
    """Testy dla modelu LoginHistory"""

    def test_create_login_history(self, regular_user):
        """Test tworzenia wpisu historii logowania"""
        login_history = LoginHistory.objects.create(
            user=regular_user,
            device_info='Chrome on Windows',
            status='success'
        )

        assert login_history.user == regular_user
        assert login_history.device_info == 'Chrome on Windows'
        assert login_history.status == 'success'
        assert login_history.login_time is not None

    def test_login_history_str_method(self, regular_user):
        """Test metody __str__ modelu LoginHistory"""
        login_history = LoginHistory.objects.create(
            user=regular_user,
            status='success'
        )

        assert str(login_history) == f"Login history of {regular_user.username}"

    def test_failed_login_history(self, regular_user):
        """Test wpisu nieudanego logowania"""
        login_history = LoginHistory.objects.create(
            user=regular_user,
            device_info='Firefox on Linux',
            status='failed'
        )

        assert login_history.status == 'failed'

@pytest.mark.django_db
class TestLoyaltyPointsModel:
    """Testy dla modelu LoyaltyPoints"""

    def test_create_loyalty_points(self, regular_user):
        """Test tworzenia punktów lojalnościowych dla użytkownika"""
        loyalty_points = LoyaltyPoints.objects.create(
            user=regular_user,
            total_points=100,
            membership_level='silver',
            points_earned_this_year=50
        )

        assert loyalty_points.user == regular_user
        assert loyalty_points.total_points == 100
        assert loyalty_points.membership_level == 'silver'
        assert loyalty_points.points_earned_this_year == 50

    def test_loyalty_points_str_method(self, regular_user):
        """Test metody __str__ modelu LoyaltyPoints"""
        loyalty_points = LoyaltyPoints.objects.create(
            user=regular_user,
            membership_level='gold'
        )

        assert str(loyalty_points) == f"{regular_user.username} - gold level"

    def test_loyalty_points_default_values(self, regular_user):
        """Test wartości domyślnych punktów lojalnościowych"""
        loyalty_points = LoyaltyPoints.objects.create(
            user=regular_user
        )

        assert loyalty_points.total_points == 0
        assert loyalty_points.membership_level == 'bronze'
        assert loyalty_points.points_earned_this_year == 0

@pytest.mark.django_db
class TestUserAPI:
    """Testy dla API użytkowników"""

    def test_list_users_as_admin(self, admin_api_client):
        """Test pobierania listy użytkowników przez administratora"""
        response = admin_api_client.get('/api/v1/users/')

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

    def test_list_users_as_regular_user(self, regular_api_client):
        """Test dostępu do listy użytkowników dla zwykłego użytkownika"""
        response = regular_api_client.get('/api/v1/users/')

        assert response.status_code == status.HTTP_200_OK

    def test_get_user_detail_as_admin(self, admin_api_client, regular_user):
        """Test pobierania szczegółów użytkownika przez administratora"""
        response = admin_api_client.get(f'/api/v1/users/{regular_user.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == regular_user.id
        assert response.data['email'] == regular_user.email
        assert response.data['username'] == regular_user.username
        assert response.data['role'] == regular_user.role

    def test_get_own_profile(self, regular_api_client, regular_user):
        """Test pobierania własnego profilu przez użytkownika"""
        response = regular_api_client.get('/api/v1/users/profile/')

        assert response.status_code == status.HTTP_200_OK

        if 'profile' in response.data:
            assert response.data['id'] == regular_user.id
            assert response.data['email'] == regular_user.email
            assert response.data['profile']['phone'] == regular_user.profile.phone

        elif 'user' in response.data:
            assert response.data['user'] == regular_user.id
            assert response.data['phone'] == regular_user.profile.phone

        else:
            assert response.data['id'] == regular_user.id
            assert response.data['email'] == regular_user.email

    def test_create_user_as_admin(self, admin_api_client):
        """Test tworzenia nowego użytkownika przez administratora"""
        data = {
            'username': 'apiuser',
            'email': 'apiuser@example.com',
            'password': 'apiuser123',
            'role': 'client'
        }

        response = admin_api_client.post('/api/v1/users/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == 'apiuser'
        assert response.data['email'] == 'apiuser@example.com'
        assert response.data['role'] == 'client'

        assert User.objects.filter(email='apiuser@example.com').exists()

    def test_update_user_as_admin(self, admin_api_client, regular_user):
        """Test aktualizacji użytkownika przez administratora"""
        data = {
            'first_name': 'Updated',
            'last_name': 'User',
            'status': 'blocked'
        }

        response = admin_api_client.patch(f'/api/v1/users/{regular_user.id}/', data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['first_name'] == 'Updated'
        assert response.data['last_name'] == 'User'
        assert response.data['status'] == 'blocked'

        updated_user = User.objects.get(id=regular_user.id)
        assert updated_user.first_name == 'Updated'
        assert updated_user.last_name == 'User'
        assert updated_user.status == 'blocked'

    def test_delete_user_as_admin(self, admin_api_client, regular_user):
        """Test usuwania użytkownika przez administratora"""
        user_id = regular_user.id

        response = admin_api_client.delete(f'/api/v1/users/{user_id}/')

        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert not User.objects.filter(id=user_id).exists()

@pytest.mark.django_db
class TestUserEdgeCases:
    """Testy dla przypadków brzegowych użytkowników"""

    def test_create_user_with_duplicate_email(self, admin_api_client, regular_user):
        """Test próby utworzenia użytkownika z istniejącym już adresem email"""
        data = {
            'username': 'uniqueusername',
            'email': regular_user.email,
            'password': 'newuser123',
            'role': 'client'
        }

        try:
            response = admin_api_client.post('/api/v1/users/', data, format='json')

            assert response.status_code == status.HTTP_400_BAD_REQUEST

            assert 'email' in str(response.data).lower()

        except RuntimeError as e:

            error_message = str(e).lower()
            assert 'duplicate' in error_message or 'already exists' in error_message
            assert 'email' in error_message

    def test_create_user_with_duplicate_username(self, admin_api_client, regular_user):
        """Test próby utworzenia użytkownika z istniejącą już nazwą użytkownika"""
        data = {
            'username': regular_user.username,
            'email': 'unique' + regular_user.email,
            'password': 'newuser123',
            'role': 'client'
        }

        try:
            response = admin_api_client.post('/api/v1/users/', data, format='json')

            assert response.status_code == status.HTTP_400_BAD_REQUEST

            assert 'username' in str(response.data).lower()

        except RuntimeError as e:

            error_message = str(e).lower()
            assert 'duplicate' in error_message or 'already exists' in error_message
            assert 'username' in error_message

    def test_create_user_with_invalid_role(self, admin_api_client):
        """Test próby utworzenia użytkownika z nieprawidłową rolą"""
        data = {
            'username': 'roleerror',
            'email': 'roleerror@example.com',
            'password': 'role123',
            'role': 'invalid_role'
        }

        response = admin_api_client.post('/api/v1/users/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED

        user_id = response.data['id']
        created_user = User.objects.get(id=user_id)
        assert created_user.role == 'invalid_role'

    def test_update_nonexistent_user(self, admin_api_client):
        """Test próby aktualizacji nieistniejącego użytkownika"""

        non_existent_id = 999999

        data = {
            'first_name': 'Non',
            'last_name': 'Existent'
        }

        try:
            response = admin_api_client.patch(f'/api/v1/users/{non_existent_id}/', data, format='json')

            assert response.status_code == status.HTTP_404_NOT_FOUND

        except RuntimeError as e:

            error_message = str(e).lower()
            assert 'does not exist' in error_message

@pytest.mark.django_db
class TestUserIntegration:
    """Testy integracyjne dla użytkowników"""

    def test_user_profile_integration(self, admin_api_client):
        """Test integracji między użytkownikiem a profilem"""

        user_data = {
            'username': 'integrationuser',
            'email': 'integration@example.com',
            'password': 'integration123',
            'role': 'client'
        }

        user_response = admin_api_client.post('/api/v1/users/', user_data, format='json')
        assert user_response.status_code == status.HTTP_201_CREATED
        user_id = user_response.data['id']

        profile_data = {
            'user': user_id,
            'address': 'ul. Integracyjna 10',
            'phone': '+48 123 456 789',
            'preferred_contact_method': 'phone'
        }

        profile_response = admin_api_client.post('/api/v1/profiles/', profile_data, format='json')
        if profile_response.status_code == status.HTTP_201_CREATED:

            assert 'user' in profile_response.data
            assert profile_response.data['address'] == 'ul. Integracyjna 10'

        user_detail = admin_api_client.get(f'/api/v1/users/{user_id}/')
        assert user_detail.status_code == status.HTTP_200_OK

        delete_response = admin_api_client.delete(f'/api/v1/users/{user_id}/')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

        assert not User.objects.filter(id=user_id).exists()

        assert not Profile.objects.filter(user_id=user_id).exists()

    def test_user_workflow(self, admin_api_client):
        """Test pełnego przepływu pracy z użytkownikiem"""

        create_data = {
            'username': 'workflow',
            'email': 'workflow@example.com',
            'password': 'workflow123',
            'role': 'client'
        }

        create_response = admin_api_client.post('/api/v1/users/', create_data, format='json')
        assert create_response.status_code == status.HTTP_201_CREATED
        user_id = create_response.data['id']

        update_data = {
            'first_name': 'Work',
            'last_name': 'Flow',
            'status': 'active'
        }

        update_response = admin_api_client.patch(f'/api/v1/users/{user_id}/', update_data, format='json')
        assert update_response.status_code == status.HTTP_200_OK
        assert update_response.data['first_name'] == 'Work'
        assert update_response.data['last_name'] == 'Flow'

        detail_response = admin_api_client.get(f'/api/v1/users/{user_id}/')
        assert detail_response.status_code == status.HTTP_200_OK
        assert detail_response.data['id'] == user_id
        assert detail_response.data['email'] == 'workflow@example.com'
        assert detail_response.data['first_name'] == 'Work'

        delete_response = admin_api_client.delete(f'/api/v1/users/{user_id}/')
        assert delete_response.status_code == status.HTTP_204_NO_CONTENT

        assert not User.objects.filter(id=user_id).exists()