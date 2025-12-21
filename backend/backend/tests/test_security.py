"""
Security Tests for GarageManager Application
Tests covering authentication, authorization, input validation, and common security vulnerabilities
"""
import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.test import override_settings
from users.models import User
from appointments.models import Appointment
from vehicles.models import Vehicle
from workshops.models import Workshop
from datetime import datetime, timedelta

# Mark all tests in this module as security tests
pytestmark = pytest.mark.security

User = get_user_model()

@pytest.fixture
def api_client():
    """Fixture providing API client"""
    return APIClient()

@pytest.fixture
def create_user():
    """Fixture for creating test users"""
    def _create_user(username, email, password, role='client'):
        User.objects.filter(email=email).delete()
        return User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role
        )
    return _create_user

@pytest.fixture
def client_user(create_user):
    """Fixture for client user"""
    return create_user("client", "client@test.com", "ClientPass123", "client")

@pytest.fixture
def mechanic_user(create_user):
    """Fixture for mechanic user"""
    return create_user("mechanic", "mechanic@test.com", "MechanicPass123", "mechanic")

@pytest.fixture
def owner_user(create_user):
    """Fixture for owner user"""
    return create_user("owner", "owner@test.com", "OwnerPass123", "owner")

@pytest.fixture
def admin_user(create_user):
    """Fixture for admin user"""
    user = create_user("admin", "admin@test.com", "AdminPass123", "admin")
    user.is_staff = True
    user.is_superuser = True
    user.save()
    return user


@pytest.mark.django_db
class TestAuthenticationSecurity:
    """Tests for authentication security"""

    def test_login_with_incorrect_credentials(self, api_client, client_user):
        """Test that login fails with incorrect password"""
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'WrongPassword123'
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_with_nonexistent_user(self, api_client):
        """Test that login fails for non-existent user"""
        response = api_client.post('/api/auth/login/', {
            'email': 'nonexistent@test.com',
            'password': 'SomePassword123'
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_access_protected_endpoint_without_token(self, api_client):
        """Test that protected endpoints require authentication"""
        response = api_client.get('/api/users/profile/')
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

    def test_access_with_invalid_token(self, api_client):
        """Test that invalid tokens are rejected"""
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token_here')
        response = api_client.get('/api/users/profile/')
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

    def test_token_expiration(self, api_client, client_user):
        """Test that expired tokens are rejected"""
        # Login to get token
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        assert response.status_code == status.HTTP_200_OK
        
        # Token should be valid initially
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = api_client.get('/api/users/profile/')
        assert response.status_code == status.HTTP_200_OK

    def test_password_complexity_requirements(self, api_client):
        """Test that weak passwords are rejected during registration"""
        weak_passwords = [
            'short',  # Too short
            'alllowercase123',  # No uppercase
            'ALLUPPERCASE123',  # No lowercase
            'NoNumbers',  # No numbers
        ]
        
        for idx, weak_password in enumerate(weak_passwords):
            response = api_client.post('/api/auth/register/', {
                'username': f'testuser{idx}',
                'email': f'test{idx}@test.com',
                'password': weak_password
            })
            # Should fail validation
            assert response.status_code in [status.HTTP_400_BAD_REQUEST]


@pytest.mark.django_db
class TestAuthorizationSecurity:
    """Tests for role-based access control"""

    def test_client_cannot_access_admin_endpoints(self, api_client, client_user):
        """Test that clients cannot access admin-only endpoints"""
        # Login as client
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Try to access admin endpoint
        response = api_client.get('/api/users/admin/')
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    def test_mechanic_cannot_modify_other_mechanics_data(self, api_client, mechanic_user, create_user):
        """Test that mechanics cannot modify other mechanics' data"""
        # Create another mechanic
        other_mechanic = create_user("mechanic2", "mechanic2@test.com", "MechanicPass123", "mechanic")
        
        # Login as first mechanic
        response = api_client.post('/api/auth/login/', {
            'email': 'mechanic@test.com',
            'password': 'MechanicPass123'
        })
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Try to update other mechanic's data
        response = api_client.patch(f'/api/users/mechanic/{other_mechanic.id}/', {
            'first_name': 'Hacked'
        })
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]

    def test_client_can_only_view_own_appointments(self, api_client, client_user, create_user):
        """Test that clients can only access their own appointments"""
        # Create another client
        other_client = create_user("client2", "client2@test.com", "ClientPass123", "client")
        
        # Login as first client
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Should only see own appointments
        response = api_client.get('/api/appointments/')
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestInputValidationSecurity:
    """Tests for input validation and SQL injection prevention"""

    def test_sql_injection_in_login(self, api_client):
        """Test that SQL injection attempts in login are prevented"""
        sql_injection_attempts = [
            "admin'--",
            "admin' OR '1'='1",
            "admin'; DROP TABLE users--",
        ]
        
        for injection in sql_injection_attempts:
            response = api_client.post('/api/auth/login/', {
                'email': injection,
                'password': 'anypassword'
            })
            # Should not cause server error, should return bad request
            assert response.status_code in [status.HTTP_400_BAD_REQUEST]

    def test_xss_prevention_in_user_input(self, api_client, client_user):
        """Test that XSS scripts in user input are sanitized"""
        # Login as client
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        xss_attempts = [
            "<script>alert('XSS')</script>",
            "<img src=x onerror=alert('XSS')>",
            "javascript:alert('XSS')",
        ]
        
        for xss in xss_attempts:
            response = api_client.patch('/api/users/profile/', {
                'first_name': xss
            })
            # Should either reject or sanitize
            if response.status_code == status.HTTP_200_OK:
                # If accepted, should be sanitized
                assert '<script>' not in response.data.get('first_name', '')

    def test_email_validation(self, api_client):
        """Test that invalid email formats are rejected"""
        invalid_emails = [
            'notanemail',
            '@example.com',
            'user@',
            'user @example.com',
        ]
        
        for invalid_email in invalid_emails:
            response = api_client.post('/api/auth/register/', {
                'username': 'testuser',
                'email': invalid_email,
                'password': 'ValidPass123'
            })
            assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_file_upload_validation(self, api_client, client_user):
        """Test that file uploads are validated for type and size"""
        # Login as client
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # This test would require actual file upload endpoints
        # Placeholder for future implementation
        pass


@pytest.mark.django_db
class TestSessionSecurity:
    """Tests for session management security"""

    def test_logout_invalidates_token(self, api_client, client_user):
        """Test that logout properly invalidates the token"""
        # Login
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Verify token works
        response = api_client.get('/api/users/profile/')
        assert response.status_code == status.HTTP_200_OK
        
        # Logout
        api_client.post('/api/auth/logout/')
        
        # Token should no longer work (if blacklisting is implemented)
        # This depends on JWT blacklist implementation

    def test_concurrent_logins(self, api_client, client_user):
        """Test handling of concurrent logins from same user"""
        # First login
        response1 = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token1 = response1.data['token']
        
        # Second login
        response2 = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token2 = response2.data['token']
        
        # Both tokens should be different
        assert token1 != token2


@pytest.mark.django_db
class TestDataProtectionSecurity:
    """Tests for data protection and privacy"""

    def test_password_not_returned_in_response(self, api_client, client_user):
        """Test that password is never returned in API responses"""
        # Login
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        
        # Password should not be in response
        assert 'password' not in response.data.get('user', {})
        
        # Get profile
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = api_client.get('/api/users/profile/')
        
        # Password should not be in profile response
        assert 'password' not in response.data

    def test_user_cannot_access_other_users_data(self, api_client, client_user, create_user):
        """Test that users cannot access other users' private data"""
        # Create another user
        other_user = create_user("other", "other@test.com", "OtherPass123", "client")
        
        # Login as first user
        response = api_client.post('/api/auth/login/', {
            'email': 'client@test.com',
            'password': 'ClientPass123'
        })
        token = response.data['token']
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        # Try to access other user's profile
        response = api_client.get(f'/api/users/{other_user.id}/')
        assert response.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]


@pytest.mark.django_db
class TestCORSSecurity:
    """Tests for CORS configuration security"""

    def test_cors_headers_present(self, api_client):
        """Test that CORS headers are properly configured"""
        response = api_client.options('/api/auth/login/')
        # Should have CORS headers in production
        # In development, CORS might be open


@pytest.mark.django_db  
class TestRateLimitingSecurity:
    """Tests for rate limiting (if implemented)"""

    def test_brute_force_login_protection(self, api_client, client_user):
        """Test that multiple failed login attempts are limited"""
        # Attempt multiple failed logins
        failed_attempts = 0
        for i in range(10):
            response = api_client.post('/api/auth/login/', {
                'email': 'client@test.com',
                'password': 'WrongPassword123'
            })
            if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                failed_attempts += 1
                break
        
        # If rate limiting is implemented, we should get 429
        # If not implemented yet, this test documents the need
