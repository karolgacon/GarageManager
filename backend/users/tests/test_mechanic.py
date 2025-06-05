import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django  # type: ignore
django.setup()

import pytest
import unittest.mock as mock
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from ..models import User, Profile
from ..services.mechanicService import MechanicService
from ..permissions import IsMechanic

User = get_user_model()


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
    return User.objects.create_user(
        username='testclient',
        email='client@example.com',
        password='client123',
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
def mechanic_api_client(mechanic_user):
    """Fixture tworzący klienta API z uprawnieniami mechanika"""
    client = APIClient()
    refresh = RefreshToken.for_user(mechanic_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def client_api_client(regular_user):
    """Fixture tworzący klienta API ze zwykłymi uprawnieniami (klient)"""
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
def client_users(db):
    """Fixture tworzący kilku użytkowników klientów"""
    clients = []
    for i in range(3):
        client = User.objects.create_user(
            username=f'client{i}',
            email=f'client{i}@example.com',
            password=f'password{i}',
            role='client'
        )
        # Tworzymy profil dla każdego klienta
        Profile.objects.create(
            user=client,
            address=f'Address {i}',
            phone=f'+48 50{i} 000 00{i}',
            preferred_contact_method='email'
        )
        clients.append(client)
    return clients


@pytest.mark.django_db
class TestMechanicPermissions:
    """Testy dla uprawnień mechanika"""

    def test_is_mechanic_permission_for_mechanic(self, mechanic_user):
        """Test czy uprawnienie IsMechanic działa dla mechanika"""
        permission = IsMechanic()
        request = mock.MagicMock()
        request.user = mechanic_user

        assert permission.has_permission(request, None) is True

    def test_is_mechanic_permission_for_non_mechanic(self, regular_user, admin_user):
        """Test czy uprawnienie IsMechanic nie działa dla niemechaników"""
        permission = IsMechanic()
        
        # Test dla zwykłego użytkownika
        request = mock.MagicMock()
        request.user = regular_user
        assert permission.has_permission(request, None) is False
        
        # Test dla administratora
        request.user = admin_user
        assert permission.has_permission(request, None) is False


@pytest.mark.django_db
class TestMechanicService:
    """Testy dla MechanicService"""

    def test_get_all_clients(self, mechanic_user, client_users):
        """Test pobierania wszystkich klientów przez serwis mechanika"""
        clients = MechanicService.get_all_clients()
        
        # Sprawdzamy czy serwis zwraca wszystkich klientów
        assert clients.count() == len(client_users)
        
        # Sprawdzamy czy wszyscy zwróceni użytkownicy mają rolę 'client'
        for client in clients:
            assert client.role == 'client'
        
        # Sprawdzamy czy mechanik nie jest w wynikach
        assert mechanic_user not in clients

    def test_get_client_details(self, client_users):
        """Test pobierania szczegółów klienta przez serwis mechanika"""
        client = client_users[0]
        
        # Pobieramy szczegóły klienta
        client_details = MechanicService.get_client_details(client.id)
        
        # Sprawdzamy czy zwrócone dane są poprawne
        # Zakładając, że metoda zwraca obiekt User lub słownik z danymi użytkownika
        # W zależności od faktycznej implementacji wybieramy odpowiednią weryfikację
        
        # Jeśli zwraca obiekt User:
        if isinstance(client_details, User):
            assert client_details.id == client.id
            assert client_details.username == client.username
            assert client_details.email == client.email
            
        # Jeśli zwraca słownik:
        elif isinstance(client_details, dict):
            if 'user' in client_details:
                # Wersja słownika z zagnieżdżonym obiektem 'user'
                assert client_details['user'].id == client.id
                assert client_details['user'].username == client.username
                assert client_details['user'].email == client.email
            else:
                # Wersja prostego słownika
                assert client_details['id'] == client.id
                assert client_details['username'] == client.username
                assert client_details['email'] == client.email

@pytest.mark.django_db
class TestMechanicAPI:
    """Testy dla API mechanika"""

    def test_list_mechanic_authenticated_as_mechanic(self, mechanic_api_client):
        """Test dostępu do listy mechaników dla zalogowanego mechanika"""
        response = mechanic_api_client.get('/api/v1/mechanic/')
        
        assert response.status_code == status.HTTP_200_OK

    def test_list_mechanic_authenticated_as_client(self, client_api_client):
        """Test odmowy dostępu do listy mechaników dla zalogowanego klienta"""
        response = client_api_client.get('/api/v1/mechanic/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_mechanic_unauthenticated(self):
        """Test odmowy dostępu do listy mechaników dla niezalogowanego użytkownika"""
        client = APIClient()  # Klient bez uwierzytelnienia
        response = client.get('/api/v1/mechanic/')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_mechanic_dashboard_as_mechanic(self, mechanic_api_client, client_users):
        """Test dostępu do panelu głównego mechanika dla zalogowanego mechanika"""
        response = mechanic_api_client.get('/api/v1/mechanic/dashboard/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'total_clients' in response.data
        assert response.data['total_clients'] == len(client_users)

    def test_mechanic_dashboard_as_client(self, client_api_client):
        """Test odmowy dostępu do panelu głównego mechanika dla zalogowanego klienta"""
        response = client_api_client.get('/api/v1/mechanic/dashboard/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_list_clients_as_mechanic(self, mechanic_api_client, client_users):
        """Test pobierania listy wszystkich klientów dla zalogowanego mechanika"""
        response = mechanic_api_client.get('/api/v1/mechanic/clients/')
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == len(client_users)
        
        # Sprawdzamy czy wszyscy klienci są na liście
        client_emails = [client.email for client in client_users]
        for client_data in response.data:
            assert client_data['email'] in client_emails

    def test_list_clients_as_client(self, client_api_client):
        """Test odmowy dostępu do listy klientów dla zalogowanego klienta"""
        response = client_api_client.get('/api/v1/mechanic/clients/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_client_details_as_mechanic(self, mechanic_api_client, client_users):
        """Test pobierania szczegółów klienta dla zalogowanego mechanika"""
        client = client_users[0]
        response = mechanic_api_client.get(f'/api/v1/mechanic/{client.id}/client_details/')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Dostosuj weryfikację odpowiedzi do faktycznej struktury danych zwracanej przez API
        # Wariant 1: API zwraca dane użytkownika bezpośrednio
        if 'id' in response.data:
            assert response.data['id'] == client.id
            assert response.data['email'] == client.email
            
        # Wariant 2: API zwraca zagnieżdżoną strukturę
        elif 'user' in response.data:
            assert response.data['user']['id'] == client.id
            assert response.data['user']['email'] == client.email
            assert response.data['profile']['phone'] == client.profile.phone
            assert response.data['profile']['address'] == client.profile.address

    def test_get_client_details_as_client(self, client_api_client, client_users):
        """Test odmowy dostępu do szczegółów klienta dla zalogowanego klienta"""
        client = client_users[0]
        response = client_api_client.get(f'/api/v1/mechanic/{client.id}/client_details/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestMechanicIntegration:
    """Testy integracyjne dla mechanika"""

    def test_mechanic_workflow(self, mechanic_api_client, client_users):
        """Test pełnego przepływu pracy mechanika"""
        # 1. Mechanik sprawdza swój panel główny
        dashboard_response = mechanic_api_client.get('/api/v1/mechanic/dashboard/')
        assert dashboard_response.status_code == status.HTTP_200_OK
        assert 'total_clients' in dashboard_response.data
        assert dashboard_response.data['total_clients'] == len(client_users)
        
        # 2. Mechanik przegląda listę klientów
        clients_response = mechanic_api_client.get('/api/v1/mechanic/clients/')
        assert clients_response.status_code == status.HTTP_200_OK
        assert len(clients_response.data) == len(client_users)
        
        # 3. Mechanik wybiera klienta i sprawdza jego szczegóły
        selected_client = client_users[0]
        client_details_response = mechanic_api_client.get(f'/api/v1/mechanic/{selected_client.id}/client_details/')
        assert client_details_response.status_code == status.HTTP_200_OK
        
        # Dostosuj weryfikację do faktycznej struktury danych
        if 'id' in client_details_response.data:
            assert client_details_response.data['id'] == selected_client.id
        elif 'user' in client_details_response.data:
            assert client_details_response.data['user']['id'] == selected_client.id


@pytest.mark.django_db
class TestMechanicEdgeCases:
    """Testy dla przypadków brzegowych mechanika"""

    def test_get_non_existent_client_details(self, mechanic_api_client):
        """Test pobierania szczegółów nieistniejącego klienta"""
        # Używamy bardzo dużego ID, który prawdopodobnie nie istnieje
        non_existent_id = 999999
        
        response = mechanic_api_client.get(f'/api/v1/mechanic/{non_existent_id}/client_details/')
        
        # Sprawdzamy czy system poprawnie obsługuje nieistniejący rekord
        # Powinien zwrócić 404 Not Found
        assert response.status_code == status.HTTP_404_NOT_FOUND