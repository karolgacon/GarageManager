import os
from decimal import Decimal
import uuid

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django  # type: ignore
django.setup()

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import Part, PartInventory
from ..serializers import PartSerializer
from users.models import User
from workshops.models import Workshop


@pytest.fixture
def test_user():
    return User.objects.create_user(username='testuser', email='test@example.com', password='password123')


@pytest.fixture
def test_admin_user():
    return User.objects.create_user(username='adminuser', email='admin@example.com', password='password123', is_staff=True)


@pytest.fixture
def api_client(test_user):
    client = APIClient()
    refresh = RefreshToken.for_user(test_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def admin_api_client(test_admin_user):
    client = APIClient()
    refresh = RefreshToken.for_user(test_admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


@pytest.fixture
def test_workshop():
    return Workshop.objects.create(
        name='Test Workshop',
        location='123 Test St',
        contact_phone='123-456-7890',
        contact_email='workshop@example.com',
        specialization='general'
    )


@pytest.fixture
def test_part():
    return Part.objects.create(
        name='Test Brake Pad',
        manufacturer='Bosch',
        price=Decimal('49.99'),
        stock_quantity=10,
        minimum_stock_level=5,
        category='brake',
        supplier='Auto Parts Inc'
    )


@pytest.fixture
def test_part_inventory(test_part, test_workshop):
    return PartInventory.objects.create(
        part=test_part,
        workshop=test_workshop,
        quantity=10,
        location='Shelf A1'
    )


@pytest.mark.django_db
def test_list_parts(api_client, test_user, test_part, test_part_inventory):
    url = '/api/v1/parts/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_list_parts_by_workshop(api_client, test_user, test_part, test_workshop, test_part_inventory):
    url = f'/api/v1/parts/?workshop_id={test_workshop.id}'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['name'] == test_part.name


@pytest.mark.django_db
def test_create_part(api_client, test_user, test_workshop):
    url = '/api/v1/parts/'
    api_client.force_authenticate(user=test_user)
    part_data = {
        'name': 'New Brake Pad',
        'manufacturer': 'Bosch',
        'price': '59.99',
        'stock_quantity': 15,
        'minimum_stock_level': 5,
        'category': 'brake',
        'supplier': 'Auto Parts Plus',
        'workshop_id': test_workshop.id
    }
    
    response = api_client.post(url, part_data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    
    # Verify that a part was created
    parts = Part.objects.all()
    assert parts.count() == 1
    part = parts.first()
    assert part.name == 'New Brake Pad'
    assert part.price == Decimal('59.99')
    
    # Verify that a part inventory was created
    inventory = PartInventory.objects.filter(part=part, workshop=test_workshop)
    assert inventory.exists()
    assert inventory.first().quantity == 15


@pytest.mark.django_db
def test_create_part_without_workshop_id(api_client, test_user):
    url = '/api/v1/parts/'
    api_client.force_authenticate(user=test_user)
    part_data = {
        'name': 'New Brake Pad',
        'manufacturer': 'Bosch',
        'price': '59.99',
        'stock_quantity': 15,
        'minimum_stock_level': 5,
        'category': 'brake',
        'supplier': 'Auto Parts Plus'
    }
    
    response = api_client.post(url, part_data, format='json')
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'workshop_id is required' in str(response.data)


@pytest.mark.django_db
def test_retrieve_part(api_client, test_user, test_part):
    url = f'/api/v1/parts/{test_part.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    
    # Check some key fields
    assert response.data['id'] == test_part.id
    assert response.data['name'] == test_part.name
    assert Decimal(response.data['price']) == test_part.price
    assert response.data['manufacturer'] == test_part.manufacturer


@pytest.mark.django_db
def test_update_part(api_client, test_user, test_part):
    url = f'/api/v1/parts/{test_part.id}/'
    api_client.force_authenticate(user=test_user)
    
    updated_data = {
        'name': test_part.name,
        'manufacturer': test_part.manufacturer,
        'price': '69.99',  # Updated price
        'stock_quantity': 20,  # Updated quantity
        'minimum_stock_level': test_part.minimum_stock_level,
        'category': test_part.category,
        'supplier': test_part.supplier
    }
    
    response = api_client.put(url, updated_data, format='json')
    assert response.status_code == status.HTTP_200_OK
    
    # Refresh from database and check updates
    test_part.refresh_from_db()
    assert test_part.price == Decimal('69.99')
    assert test_part.stock_quantity == 20


@pytest.mark.django_db
def test_delete_part(api_client, test_user, test_part):
    url = f'/api/v1/parts/{test_part.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Part.objects.count() == 0


@pytest.mark.django_db
def test_admin_can_see_all_parts(admin_api_client, test_admin_user, test_part, test_workshop, test_part_inventory):
    # Create another part and workshop
    workshop2 = Workshop.objects.create(
        name='Workshop 2', 
        location='456 Test St', 
        contact_phone='987-654-3210',
        specialization='general'
    )
    part2 = Part.objects.create(name='Test Oil Filter', manufacturer='Mann', price=Decimal('12.99'), category='engine')
    PartInventory.objects.create(part=part2, workshop=workshop2, quantity=5)
    
    url = '/api/v1/parts/'
    admin_api_client.force_authenticate(user=test_admin_user)
    response = admin_api_client.get(url)
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2  # Admin should see both parts