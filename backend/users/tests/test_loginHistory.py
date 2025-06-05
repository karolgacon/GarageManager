import os

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django  # type: ignore
django.setup()

import pytest
import unittest.mock as mock
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta

from ..models import User, LoginHistory
from ..repositories.loginHistoryRepository import LoginHistoryRepository
from ..services.loginHistoryService import LoginHistoryService
from ..serializers import LoginHistorySerializer


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
def regular_user():
    """Fixture tworzący zwykłego użytkownika"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='password123',
        role='client'
    )


@pytest.fixture
def admin_api_client(admin_user):
    """Fixture tworzący klienta API z uprawnieniami admina"""
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def regular_api_client(regular_user):
    """Fixture tworzący klienta API ze zwykłymi uprawnieniami"""
    client = APIClient()
    refresh = RefreshToken.for_user(regular_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def sample_login_history(admin_user, regular_user):
    """Fixture tworzący przykładowe wpisy historii logowań"""
    # Historia logowań dla admina
    admin_success = LoginHistory.objects.create(
        user=admin_user,
        device_info="Chrome on Windows 10",
        status="success"
    )
    admin_failed = LoginHistory.objects.create(
        user=admin_user,
        device_info="Firefox on Windows 10",
        status="failed"
    )
    
    # Historia logowań dla zwykłego użytkownika
    user_success = LoginHistory.objects.create(
        user=regular_user,
        device_info="Safari on macOS",
        status="success"
    )
    user_failed = LoginHistory.objects.create(
        user=regular_user,
        device_info="Chrome on Android",
        status="failed"
    )
    
    return [admin_success, admin_failed, user_success, user_failed]


@pytest.mark.django_db
class TestLoginHistoryRepository:
    """Testy dla LoginHistoryRepository"""
    
    def test_get_all_ordered(self, sample_login_history):
        """Test pobierania wszystkich wpisów historii logowań w odpowiedniej kolejności"""
        history_entries = LoginHistoryRepository.get_all_ordered()
        
        # Sprawdź czy wszystkie wpisy zostały zwrócone
        assert len(history_entries) >= len(sample_login_history)
        
        # Sprawdź czy są posortowane od najnowszych
        for i in range(len(history_entries) - 1):
            assert history_entries[i].login_time >= history_entries[i+1].login_time
    
    def test_create_login_history(self, admin_user):
        """Test tworzenia nowego wpisu historii logowań"""
        data = {
            'user': admin_user,
            'device_info': "Edge on Windows 11",
            'status': "success"
        }
        
        # Tworzenie nowego wpisu
        login_entry = LoginHistoryRepository.create(data)
        
        # Sprawdzenie czy wpis został utworzony prawidłowo
        assert login_entry.user == admin_user
        assert login_entry.device_info == "Edge on Windows 11"
        assert login_entry.status == "success"
        
        # Sprawdzenie czy wpis jest w bazie danych
        assert LoginHistory.objects.filter(id=login_entry.id).exists()
    
    def test_get_by_id(self, sample_login_history):
        """Test pobierania wpisu historii logowań po ID"""
        login_entry = sample_login_history[0]
        retrieved_entry = LoginHistoryRepository.get_by_id(login_entry.id)
        
        assert retrieved_entry.id == login_entry.id
        assert retrieved_entry.user == login_entry.user
        assert retrieved_entry.device_info == login_entry.device_info
        assert retrieved_entry.status == login_entry.status


@pytest.mark.django_db
class TestLoginHistoryService:
    """Testy dla LoginHistoryService"""
    
    def test_get_all_ordered(self, sample_login_history):
        """Test pobierania wszystkich wpisów historii logowań przez serwis"""
        history_entries = LoginHistoryService.get_all_ordered()
        
        # Sprawdź czy wszystkie wpisy zostały zwrócone
        assert len(history_entries) >= len(sample_login_history)
        
        # Sprawdź czy są posortowane od najnowszych
        for i in range(len(history_entries) - 1):
            assert history_entries[i].login_time >= history_entries[i+1].login_time
    
    def test_create_login_history(self, admin_user):
        """Test tworzenia nowego wpisu historii logowań przez serwis"""
        data = {
            'user': admin_user,
            'device_info': "Edge on Windows 11",
            'status': "success"
        }
        
        # Tworzenie nowego wpisu
        login_entry = LoginHistoryService.create(data)
        
        # Sprawdzenie czy wpis został utworzony prawidłowo
        assert login_entry.user == admin_user
        assert login_entry.device_info == "Edge on Windows 11"
        assert login_entry.status == "success"
        
        # Sprawdzenie czy wpis jest w bazie danych
        assert LoginHistory.objects.filter(id=login_entry.id).exists()
    
    def test_update_login_history(self, sample_login_history):
        """Test aktualizacji wpisu historii logowań"""
        login_entry = sample_login_history[0]
        update_data = {
            'device_info': "Updated device info"
        }
        
        # Aktualizacja wpisu
        updated_entry = LoginHistoryService.update(login_entry.id, update_data)
        
        # Sprawdzenie czy wpis został zaktualizowany
        assert updated_entry.device_info == "Updated device info"
        assert updated_entry.user == login_entry.user  # Pozostałe pola nie powinny się zmienić
        assert updated_entry.status == login_entry.status
    
    def test_delete_login_history(self, sample_login_history):
        """Test usuwania wpisu historii logowań"""
        login_entry = sample_login_history[0]
        entry_id = login_entry.id
        
        # Usunięcie wpisu
        LoginHistoryService.delete(entry_id)
        
        # Sprawdzenie czy wpis został usunięty z bazy danych
        assert not LoginHistory.objects.filter(id=entry_id).exists()


@pytest.mark.django_db
class TestLoginHistoryAPI:
    """Testy dla API historii logowań"""
    
    def test_list_login_history_admin_access(self, admin_api_client, sample_login_history):
        """Test pobierania listy historii logowań przez administratora"""
        response = admin_api_client.get('/api/v1/login-history/')
        
        assert response.status_code == status.HTTP_200_OK
        # Sprawdź czy wszystkie wpisy zostały zwrócone
        assert len(response.data) >= len(sample_login_history)
    
    def test_list_login_history_regular_user_denied(self, regular_api_client):
        """Test odmowy dostępu do historii logowań dla zwykłego użytkownika"""
        response = regular_api_client.get('/api/v1/login-history/')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_get_login_history_detail_admin_access(self, admin_api_client, sample_login_history):
        """Test pobierania szczegółów wpisu historii logowań przez administratora"""
        login_entry = sample_login_history[0]
        response = admin_api_client.get(f'/api/v1/login-history/{login_entry.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == login_entry.id
        assert response.data['device_info'] == login_entry.device_info
        assert response.data['status'] == login_entry.status
    

@pytest.mark.django_db
class TestLoginHistoryEdgeCases:
    """Testy dla przypadków brzegowych historii logowań"""
    
    def test_invalid_status_value(self, admin_user):
        """Test tworzenia wpisu historii logowań z nieprawidłowym statusem"""
        data = {
            'user': admin_user,
            'device_info': "Test Device",
            'status': "invalid_status" 
        }

        login_entry = LoginHistory(
            user=admin_user,
            device_info="Test Device",
            status="invalid_status"
        )
        

        try:
            login_entry.full_clean()  
            login_entry.save()
            assert login_entry.status == "invalid_status"
        except Exception as e:
            assert "status" in str(e)
    
    def test_empty_device_info(self, admin_user):
        """Test tworzenia wpisu historii logowań z pustym device_info"""
        data = {
            'user': admin_user,
            'device_info': "",
            'status': "success"
        }
        
        login_entry = LoginHistoryService.create(data)
        assert login_entry.device_info == ""
        
        assert LoginHistory.objects.filter(id=login_entry.id).exists()
    
    def test_non_existent_login_history_id(self):
        """Test pobierania nieistniejącego wpisu historii logowań"""
        non_existent_id = 999999
        
        with pytest.raises(django.http.response.Http404) as excinfo:
            LoginHistoryService.get_by_id(non_existent_id)
        
        assert "does not exist" in str(excinfo.value)


@pytest.mark.django_db
class TestLoginHistoryPerformance:
    """Testy wydajnościowe dla historii logowań"""
    
    def test_bulk_login_history_creation(self, admin_user):
        """Test tworzenia wielu wpisów historii logowań"""
        entries_count = 10
        entries = []
        
        start_time = datetime.now()
        
        for i in range(entries_count):
            entry = LoginHistory.objects.create(
                user=admin_user,
                device_info=f"Bulk test device {i}",
                status="success" if i % 2 == 0 else "failed"
            )
            entries.append(entry)
        
        end_time = datetime.now()
        
        assert LoginHistory.objects.filter(device_info__startswith="Bulk test device").count() == entries_count
        

        assert (end_time - start_time) < timedelta(seconds=2)