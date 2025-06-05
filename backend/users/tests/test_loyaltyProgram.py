import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
import unittest.mock as mock
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.exceptions import ValidationError

from ..models import User, LoyaltyPoints
from ..repositories.loyaltyPointsRepository import LoyaltyPointsRepository
from ..services.loyaltyPointsService import LoyaltyPointsService
from ..serializers import LoyaltyPointsSerializer

@pytest.fixture
def regular_user():
    """Fixture tworzący zwykłego użytkownika"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='password123',
        role='client'
    )

@pytest.fixture
def admin_user():
    """Fixture tworzący użytkownika administratora"""
    return User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='admin123',
        is_staff=True,
        is_superuser=True,
        role='admin'
    )

@pytest.fixture
def loyalty_points(regular_user):
    """Fixture tworzący punkty lojalnościowe dla zwykłego użytkownika"""
    return LoyaltyPoints.objects.create(
        user=regular_user,
        total_points=100,
        membership_level='silver',
        points_earned_this_year=50
    )

@pytest.fixture
def regular_api_client(regular_user):
    """Fixture tworzący klienta API ze zwykłymi uprawnieniami"""
    client = APIClient()
    refresh = RefreshToken.for_user(regular_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def admin_api_client(admin_user):
    """Fixture tworzący klienta API z uprawnieniami admina"""
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.mark.django_db
class TestLoyaltyPointsRepository:
    """Testy dla LoyaltyPointsRepository"""

    def test_get_by_user_existing(self, regular_user, loyalty_points):
        """Test pobierania punktów lojalnościowych dla istniejącego użytkownika"""
        result = LoyaltyPointsRepository.get_by_user(regular_user)

        assert result is not None
        assert result.user == regular_user
        assert result.total_points == 100
        assert result.membership_level == 'silver'

    def test_get_by_user_non_existing(self, admin_user):
        """Test pobierania punktów lojalnościowych dla użytkownika bez punktów"""
        result = LoyaltyPointsRepository.get_by_user(admin_user)

        assert result is None

    def test_create_loyalty_points(self, admin_user):
        """Test tworzenia nowych punktów lojalnościowych"""
        data = {
            'user': admin_user,
            'total_points': 50,
            'membership_level': 'bronze',
            'points_earned_this_year': 25
        }

        loyalty_points = LoyaltyPointsRepository.create(data)

        assert loyalty_points.user == admin_user
        assert loyalty_points.total_points == 50
        assert loyalty_points.membership_level == 'bronze'
        assert loyalty_points.points_earned_this_year == 25

        assert LoyaltyPoints.objects.filter(user=admin_user).exists()

@pytest.mark.django_db
class TestLoyaltyPointsService:
    """Testy dla LoyaltyPointsService"""

    def test_get_loyalty_status_success(self, regular_user, loyalty_points):
        """Test pobierania statusu lojalnościowego dla użytkownika z punktami"""
        result = LoyaltyPointsService.get_loyalty_status(regular_user)

        assert result is not None
        assert result.user == regular_user
        assert result.total_points == 100
        assert result.membership_level == 'silver'

    def test_get_loyalty_status_not_found(self, admin_user):
        """Test pobierania statusu lojalnościowego dla użytkownika bez punktów"""
        with pytest.raises(ValidationError) as excinfo:
            LoyaltyPointsService.get_loyalty_status(admin_user)

        assert "Loyalty points not found" in str(excinfo.value)

    def test_update_loyalty_points(self, regular_user, loyalty_points):
        """Test aktualizacji punktów lojalnościowych"""
        updated_data = {
            'total_points': 200,
            'membership_level': 'gold'
        }

        result = LoyaltyPointsService.update(loyalty_points.id, updated_data)

        assert result.total_points == 200
        assert result.membership_level == 'gold'

        assert result.user == regular_user

    def test_delete_loyalty_points(self, regular_user, loyalty_points):
        """Test usuwania punktów lojalnościowych"""
        LoyaltyPointsService.delete(loyalty_points.id)

        assert not LoyaltyPoints.objects.filter(id=loyalty_points.id).exists()

@pytest.mark.django_db
class TestLoyaltyProgramAPI:
    """Testy dla API programu lojalnościowego"""

    def test_list_loyalty_points_authenticated(self, regular_api_client, loyalty_points, regular_user):
        """Test pobierania listy punktów lojalnościowych przez uwierzytelnionego użytkownika"""
        response = regular_api_client.get('/api/v1/loyalty-program/')

        assert response.status_code == status.HTTP_200_OK

        assert len(response.data) == 1
        assert response.data[0]['user'] == regular_user.id
        assert response.data[0]['total_points'] == 100
        assert response.data[0]['membership_level'] == 'silver'

    def test_list_loyalty_points_unauthenticated(self):
        """Test odmowy dostępu do listy punktów lojalnościowych dla niezalogowanego użytkownika"""
        client = APIClient()
        response = client.get('/api/v1/loyalty-program/')

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_loyalty_points_detail(self, regular_api_client, loyalty_points):
        """Test pobierania szczegółów punktów lojalnościowych"""
        response = regular_api_client.get(f'/api/v1/loyalty-program/{loyalty_points.id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == loyalty_points.id
        assert response.data['total_points'] == loyalty_points.total_points
        assert response.data['membership_level'] == loyalty_points.membership_level

    def test_update_loyalty_points(self, regular_api_client, loyalty_points):
        """Test aktualizacji punktów lojalnościowych"""
        data = {
            'total_points': 150,
            'membership_level': 'gold'
        }

        response = regular_api_client.patch(f'/api/v1/loyalty-program/{loyalty_points.id}/', data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_points'] == 150
        assert response.data['membership_level'] == 'gold'

        updated = LoyaltyPoints.objects.get(id=loyalty_points.id)
        assert updated.total_points == 150
        assert updated.membership_level == 'gold'

    def test_delete_loyalty_points(self, regular_api_client, loyalty_points):
        """Test usuwania punktów lojalnościowych"""
        response = regular_api_client.delete(f'/api/v1/loyalty-program/{loyalty_points.id}/')

        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert not LoyaltyPoints.objects.filter(id=loyalty_points.id).exists()

    def test_my_loyalty_status(self, regular_api_client, loyalty_points, regular_user):
        """Test pobierania własnego statusu lojalnościowego"""
        response = regular_api_client.get('/api/v1/loyalty-program/my-loyalty-status/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_points'] == 100
        assert response.data['membership_level'] == 'silver'
        assert response.data['user'] == regular_user.id

    def test_my_loyalty_status_not_found(self, admin_api_client):
        """Test pobierania własnego statusu lojalnościowego dla użytkownika bez punktów"""
        response = admin_api_client.get('/api/v1/loyalty-program/my-loyalty-status/')

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "error" in response.data
        assert "Loyalty points not found" in response.data["error"]

@pytest.mark.django_db
class TestLoyaltyPointsEdgeCases:
    """Testy dla przypadków brzegowych programu lojalnościowego"""

    def test_negative_points(self, regular_user):
        """Test tworzenia punktów lojalnościowych z ujemnymi punktami"""

        data = {
            'user': regular_user,
            'total_points': -50,
            'membership_level': 'bronze'
        }

        try:
            loyalty = LoyaltyPointsService.create(data)

            assert loyalty.total_points == -50
        except ValidationError as e:

            assert "total_points" in str(e)

    def test_invalid_level(self, regular_user):
        """Test tworzenia punktów lojalnościowych z niepoprawnym poziomem"""
        data = {
            'user': regular_user,
            'total_points': 50,
            'membership_level': 'ultraplatinum'
        }

        try:
            loyalty = LoyaltyPointsService.create(data)

            assert loyalty.membership_level == 'ultraplatinum'
        except ValidationError as e:

            assert "membership_level" in str(e)

    def test_points_earned_this_year_greater_than_total(self, regular_user):
        """Test tworzenia punktów lojalnościowych z punktami w tym roku większymi niż łączne punkty"""
        data = {
            'user': regular_user,
            'total_points': 50,
            'membership_level': 'bronze',
            'points_earned_this_year': 100
        }

        try:
            loyalty = LoyaltyPointsService.create(data)

            assert loyalty.points_earned_this_year == 100
            assert loyalty.total_points == 50
        except ValidationError as e:

            assert "points_earned_this_year" in str(e)

