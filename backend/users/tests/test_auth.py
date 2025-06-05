import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
import unittest.mock as mock
from rest_framework import status
from rest_framework.test import APIClient
from django.core.exceptions import ValidationError
from ..models import User
from ..services.authService import AuthService

@pytest.fixture
def test_user_data():
    """Fixture zwracająca dane testowego użytkownika"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPassword123"
    }

@pytest.fixture
def registered_user(test_user_data):
    """Fixture tworzący użytkownika w bazie danych"""

    User.objects.filter(email=test_user_data["email"]).delete()

    return User.objects.create_user(
        username=test_user_data["username"],
        email=test_user_data["email"],
        password=test_user_data["password"],
        role='client'
    )

@pytest.fixture
def api_client():
    """Fixture zwracający klienta API"""
    return APIClient()

@pytest.mark.django_db
class TestAuthService:
    """Testy dla AuthService"""

    def test_register_user_success(self):
        """Test poprawnej rejestracji użytkownika"""

        User.objects.filter(email="newemail@example.com").delete()

        result = AuthService.register_user(
            username="newuser",
            password="NewPassword123",
            email="newemail@example.com"
        )

        assert User.objects.filter(email="newemail@example.com").exists()

        assert "refresh" in result
        assert "access" in result
        assert "user" in result
        assert result["user"]["username"] == "newuser"
        assert result["user"]["email"] == "newemail@example.com"
        assert result["user"]["is_active"] is True

    def test_register_user_duplicate_email(self, registered_user, test_user_data):
        """Test rejestracji z istniejącym już emailem"""
        with pytest.raises(ValueError) as excinfo:
            AuthService.register_user(
                username="anotheruser",
                password="AnotherPassword123",
                email=test_user_data["email"]
            )

        assert "User with this email already exists" in str(excinfo.value)

    def test_login_user_success(self, registered_user, test_user_data):
        """Test poprawnego logowania użytkownika"""
        result = AuthService.login_user(
            email=test_user_data["email"],
            password=test_user_data["password"]
        )

        assert "token" in result
        assert "refresh" in result
        assert "user" in result
        assert result["user"]["username"] == test_user_data["username"]
        assert result["user"]["email"] == test_user_data["email"]
        assert result["user"]["is_active"] is True

    def test_login_user_invalid_credentials(self, registered_user, test_user_data):
        """Test logowania z nieprawidłowymi danymi"""
        with pytest.raises(ValueError) as excinfo:
            AuthService.login_user(
                email=test_user_data["email"],
                password="WrongPassword123"
            )

        assert "Invalid email or password" in str(excinfo.value)

    def test_login_user_nonexistent_email(self):
        """Test logowania z nieistniejącym emailem"""
        with pytest.raises(ValueError) as excinfo:
            AuthService.login_user(
                email="nonexistent@example.com",
                password="SomePassword123"
            )

        assert "Invalid email or password" in str(excinfo.value)

@pytest.mark.django_db
class TestAuthAPI:
    """Testy dla endpointów API autoryzacji"""

    def test_register_api_success(self, api_client):
        """Test rejestracji przez API"""

        User.objects.filter(email="newapi@example.com").delete()

        data = {
            "username": "apiuser",
            "email": "newapi@example.com",
            "password": "ApiPassword123"
        }

        with mock.patch('users.view_collection.authView.send_template_email') as mock_send_email:
            response = api_client.post("/api/v1/user/register/", data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert "refresh" in response.data
        assert "access" in response.data
        assert "user" in response.data

        user = User.objects.get(email="newapi@example.com")
        assert user.username == "apiuser"

        mock_send_email.delay.assert_called_once()

    def test_register_api_duplicate_email(self, api_client, registered_user, test_user_data):
        """Test rejestracji z istniejącym emailem przez API"""
        data = {
            "username": "anotherapiuser",
            "email": test_user_data["email"],
            "password": "AnotherApiPassword123"
        }

        with mock.patch('users.view_collection.authView.send_template_email'):
            response = api_client.post("/api/v1/user/register/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data
        assert "already exists" in response.data["error"]

    def test_login_api_success(self, api_client, registered_user, test_user_data):
        """Test logowania przez API"""
        data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }

        response = api_client.post("/api/v1/user/login/", data, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert "token" in response.data
        assert "refresh" in response.data
        assert "user" in response.data
        assert response.data["user"]["email"] == test_user_data["email"]

    def test_login_api_invalid_credentials(self, api_client, registered_user, test_user_data):
        """Test logowania z nieprawidłowymi danymi przez API"""
        data = {
            "email": test_user_data["email"],
            "password": "WrongPassword123"
        }

        response = api_client.post("/api/v1/user/login/", data, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    def test_get_public_user_details(self, api_client, registered_user):
        """Test pobierania publicznych danych użytkownika"""
        response = api_client.get(f"/api/v1/user/{registered_user.id}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == registered_user.id
        assert response.data["username"] == registered_user.username
        assert response.data["email"] == registered_user.email
        assert response.data["role"] == registered_user.role

    def test_get_nonexistent_user(self, api_client):
        """Test pobierania danych nieistniejącego użytkownika"""

        response = api_client.get("/api/v1/user/999999/")

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

@pytest.mark.django_db
class TestAuthEndToEnd:
    """Testy end-to-end dla procesu autoryzacji"""

    def test_register_and_login_flow(self, api_client):
        """Test pełnego przepływu: rejestracja i logowanie"""

        User.objects.filter(email="endtoend@example.com").delete()

        register_data = {
            "username": "endtoenduser",
            "email": "endtoend@example.com",
            "password": "EndToEndPass123"
        }

        with mock.patch('users.view_collection.authView.send_template_email'):
            register_response = api_client.post("/api/v1/user/register/", register_data, format="json")

        assert register_response.status_code == status.HTTP_201_CREATED

        login_data = {
            "email": "endtoend@example.com",
            "password": "EndToEndPass123"
        }

        login_response = api_client.post("/api/v1/user/login/", login_data, format="json")

        assert login_response.status_code == status.HTTP_200_OK
        assert "token" in login_response.data

        token = login_response.data["token"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

@pytest.mark.django_db
class TestAuthEdgeCases:
    """Testy dla przypadków brzegowych autoryzacji"""

    def test_register_with_empty_data(self, api_client):
        """Test rejestracji z pustymi danymi"""
        with mock.patch('users.view_collection.authView.send_template_email'):
            response = api_client.post("/api/v1/user/register/", {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_with_empty_data(self, api_client):
        """Test logowania z pustymi danymi"""
        response = api_client.post("/api/v1/user/login/", {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_service_raises_exceptions(self):
        """Test czy serwisy poprawnie rzucają wyjątki"""
        with pytest.raises(ValueError):

            AuthService.register_user(username=None, email=None, password=None)

        with pytest.raises(ValueError):
            AuthService.login_user(email=None, password=None)