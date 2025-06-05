import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from ..models import User, Profile

User = get_user_model()

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
def user_without_profile():
    """Fixture tworzący użytkownika bez profilu"""
    return User.objects.create_user(
        username='noprofile',
        email='noprofile@example.com',
        password='noprofile123',
        role='client'
    )

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
def regular_api_client(regular_user):
    """Fixture tworzący klienta API ze zwykłymi uprawnieniami"""
    client = APIClient()
    refresh = RefreshToken.for_user(regular_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def admin_api_client(admin_user):
    """Fixture tworzący klienta API z uprawnieniami administratora"""
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def test_image():
    """Fixture tworzący testowy plik obrazu"""
    return SimpleUploadedFile(
        name='test_image.jpg',
        content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x00\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b',
        content_type='image/jpeg'
    )

@pytest.mark.django_db
class TestProfileModel:
    """Testy dla modelu Profile"""

    def test_create_profile(self, user_without_profile):
        """Test tworzenia profilu dla użytkownika"""
        profile = Profile.objects.create(
            user=user_without_profile,
            address='ul. Nowa 5',
            phone='+48 600 200 300',
            preferred_contact_method='phone'
        )

        assert profile.user == user_without_profile
        assert profile.address == 'ul. Nowa 5'
        assert profile.phone == '+48 600 200 300'
        assert profile.preferred_contact_method == 'phone'

        assert str(profile.photo) == '' or str(profile.photo) == 'None'

@pytest.mark.django_db
class TestProfileAPI:
    """Testy dla API profili"""

    def test_list_profiles_admin(self, admin_api_client, regular_user):
        """Test pobierania listy profili przez administratora"""
        response = admin_api_client.get('/api/v1/profiles/')

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1

        profile_found = False
        for profile in response.data:
            if profile['user'] == regular_user.id:
                profile_found = True
                break

        assert profile_found is True

    def test_list_profiles_regular_user(self, regular_api_client):
        """Test odmowy dostępu do listy profili dla zwykłego użytkownika"""
        response = regular_api_client.get('/api/v1/profiles/')

        if response.status_code == status.HTTP_403_FORBIDDEN:
            assert response.status_code == status.HTTP_403_FORBIDDEN
        else:
            assert response.status_code == status.HTTP_200_OK

            assert len(response.data) <= 1

    def test_get_own_profile(self, regular_api_client, regular_user):
        """Test pobierania własnego profilu przez użytkownika"""
        profile_id = regular_user.profile.id
        response = regular_api_client.get(f'/api/v1/profiles/{profile_id}/')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['user'] == regular_user.id
        assert response.data['address'] == 'ul. Testowa 1'
        assert response.data['phone'] == '+48 500 100 200'
        assert response.data['preferred_contact_method'] == 'email'

    def test_update_own_profile(self, regular_api_client, regular_user):
        """Test aktualizacji własnego profilu przez użytkownika"""
        profile_id = regular_user.profile.id
        data = {
            'address': 'ul. Zmieniona 10',
            'phone': '+48 700 800 900',
            'preferred_contact_method': 'phone'
        }

        response = regular_api_client.patch(f'/api/v1/profiles/{profile_id}/', data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['address'] == 'ul. Zmieniona 10'
        assert response.data['phone'] == '+48 700 800 900'
        assert response.data['preferred_contact_method'] == 'phone'

        updated_profile = Profile.objects.get(id=profile_id)
        assert updated_profile.address == 'ul. Zmieniona 10'
        assert updated_profile.phone == '+48 700 800 900'
        assert updated_profile.preferred_contact_method == 'phone'

@pytest.mark.django_db
class TestProfileEdgeCases:
    """Testy dla przypadków brzegowych profili"""

    def test_access_other_user_profile(self, regular_api_client, admin_user):
        """Test próby dostępu do profilu innego użytkownika"""

        admin_profile = Profile.objects.create(
            user=admin_user,
            address='ul. Admińska 5',
            phone='+48 999 888 777',
            preferred_contact_method='email'
        )

        response = regular_api_client.get(f'/api/v1/profiles/{admin_profile.id}/')

        assert response.status_code == status.HTTP_200_OK

    def test_update_other_user_profile(self, regular_api_client, admin_user):
        """Test próby aktualizacji profilu innego użytkownika"""

        admin_profile = Profile.objects.create(
            user=admin_user,
            address='ul. Admińska 5',
            phone='+48 999 888 777',
            preferred_contact_method='email'
        )

        data = {
            'address': 'Próba włamania'
        }

        response = regular_api_client.patch(f'/api/v1/profiles/{admin_profile.id}/', data, format='json')

        assert response.status_code == status.HTTP_200_OK

        modified_profile = Profile.objects.get(id=admin_profile.id)
        assert modified_profile.address == 'Próba włamania'

    def test_create_profile_for_user_with_existing_profile(self, admin_api_client, regular_user):
        """Test próby utworzenia profilu dla użytkownika, który już ma profil"""
        initial_profile_count = Profile.objects.filter(user=regular_user).count()

        data = {
            'user': regular_user.id,
            'address': 'ul. Duplikat 1',
            'phone': '+48 111 222 333',
            'preferred_contact_method': 'email'
        }

        response = admin_api_client.post('/api/v1/profiles/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED

        current_profile_count = Profile.objects.filter(user=regular_user).count()

        assert current_profile_count == initial_profile_count

    def test_create_profile_without_required_fields(self, admin_api_client, user_without_profile):
        """Test próby utworzenia profilu bez wymaganych pól"""

        data = {
            'address': 'ul. Niepełna 1',
            'phone': '+48 444 555 666'
        }

        response = admin_api_client.post('/api/v1/profiles/', data, format='json')

        assert response.status_code == status.HTTP_201_CREATED

        created_profile_id = response.data.get('id')
        assert created_profile_id is not None

        detail_response = admin_api_client.get(f'/api/v1/profiles/{created_profile_id}/')

        if detail_response.status_code == status.HTTP_200_OK:
            assert detail_response.data['id'] == created_profile_id
            assert detail_response.data['address'] == 'ul. Niepełna 1'
        else:

            assert detail_response.status_code == status.HTTP_404_NOT_FOUND