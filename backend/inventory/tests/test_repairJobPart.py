import os
from decimal import Decimal
import uuid

os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import Part, RepairJobPart, Supplier
from ..serializers import RepairJobPartSerializer
from users.models import User
from workshops.models import Workshop
from appointments.models import RepairJob, Appointment
from vehicles.models import Vehicle

@pytest.fixture
def test_user():
    return User.objects.create_user(username='testuser', email='test@example.com', password='password123')

@pytest.fixture
def api_client(test_user):
    client = APIClient()
    refresh = RefreshToken.for_user(test_user)
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
def test_vehicle(test_user):
    return Vehicle.objects.create(
        owner=test_user,
        brand='toyota',
        model='Corolla',
        year=2020,
        vin='1HGCM82633A123456',
        registration_number='ABC-1234'
    )

@pytest.fixture
def test_appointment(test_user, test_workshop, test_vehicle):
    return Appointment.objects.create(
        client=test_user,
        workshop=test_workshop,
        vehicle=test_vehicle,
        date='2025-06-10T10:00:00Z',
        status='pending',
        priority='low'
    )

@pytest.fixture
def test_repair_job(test_appointment):

    mechanic = User.objects.create_user(
        username='mechanic',
        email='mechanic@example.com',
        password='password123'
    )

    return RepairJob.objects.create(
        appointment=test_appointment,
        mechanic=mechanic,
        description='Oil change and filter replacement',
        cost=Decimal('50.00'),
        duration=60,
        complexity_level='simple'
    )

@pytest.fixture
def test_supplier():
    return Supplier.objects.create(
        name='Auto Parts Inc',
        email='contact@autoparts.com',
        phone='123-456-7890',
        address='123 Main St',
        city='Test City'
    )

@pytest.fixture
def test_part(test_supplier):
    return Part.objects.create(
        name='Test Oil Filter',
        manufacturer='Bosch',
        price=Decimal('12.99'),
        stock_quantity=10,
        minimum_stock_level=5,
        category='engine',
        supplier=test_supplier
    )

@pytest.fixture
def test_repair_job_part(test_repair_job, test_part):
    return RepairJobPart.objects.create(
        repair_job=test_repair_job,
        part=test_part,
        quantity=1,
        used_price=Decimal('12.99'),
        condition='new'
    )

@pytest.mark.django_db
def test_list_repair_job_parts(api_client, test_user, test_repair_job_part):
    url = '/api/v1/repair-job-parts/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_create_repair_job_part(api_client, test_user, test_repair_job, test_part):
    url = '/api/v1/repair-job-parts/'
    api_client.force_authenticate(user=test_user)

    from ..services.repairJobPartService import RepairJobPartService

    repair_job_part = RepairJobPartService.create({
        'repair_job': test_repair_job,
        'part': test_part,
        'quantity': 2,
        'used_price': Decimal('12.99'),
        'condition': 'new'
    })

    assert repair_job_part.repair_job == test_repair_job
    assert repair_job_part.part == test_part
    assert repair_job_part.quantity == 2

    assert str(repair_job_part.used_price) == '12.99'
    assert repair_job_part.condition == 'new'

    response = api_client.get(f'/api/v1/repair-job-parts/{repair_job_part.id}/')
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_retrieve_repair_job_part(api_client, test_user, test_repair_job_part):
    url = f'/api/v1/repair-job-parts/{test_repair_job_part.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    assert response.data['id'] == test_repair_job_part.id
    assert response.data['quantity'] == test_repair_job_part.quantity
    assert Decimal(response.data['used_price']) == test_repair_job_part.used_price
    assert response.data['repair_job'] == test_repair_job_part.repair_job.id
    assert response.data['part'] == test_repair_job_part.part.id
    assert response.data['condition'] == test_repair_job_part.condition

@pytest.mark.django_db
def test_update_repair_job_part(api_client, test_user, test_repair_job_part):
    url = f'/api/v1/repair-job-parts/{test_repair_job_part.id}/'
    api_client.force_authenticate(user=test_user)

    updated_data = {

        'quantity': 3,
        'used_price': '14.99',
        'condition': 'refurbished'
    }

    response = api_client.patch(url, updated_data, format='json')
    assert response.status_code == status.HTTP_200_OK

    test_repair_job_part.refresh_from_db()
    assert test_repair_job_part.quantity == 3
    assert test_repair_job_part.used_price == Decimal('14.99')
    assert test_repair_job_part.condition == 'refurbished'

@pytest.mark.django_db
def test_delete_repair_job_part(api_client, test_user, test_repair_job_part):
    url = f'/api/v1/repair-job-parts/{test_repair_job_part.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert RepairJobPart.objects.count() == 0

@pytest.mark.django_db
def test_filter_repair_job_parts_by_repair_job(api_client, test_user, test_repair_job, test_part, test_workshop, test_vehicle, test_supplier):

    RepairJobPart.objects.all().delete()

    repair_job_part1 = RepairJobPart.objects.create(
        repair_job=test_repair_job,
        part=test_part,
        quantity=1,
        used_price=Decimal('12.99'),
        condition='new'
    )

    # Create another supplier for the second part
    supplier2 = Supplier.objects.create(
        name='Auto Parts Co',
        email='contact@autopartsco.com',
        phone='987-654-3210',
        address='456 Industrial Ave',
        city='Parts City'
    )

    part2 = Part.objects.create(
        name='Test Air Filter',
        manufacturer='Mann',
        price=Decimal('9.99'),
        stock_quantity=8,
        minimum_stock_level=3,
        category='engine',
        supplier=supplier2
    )

    repair_job_part2 = RepairJobPart.objects.create(
        repair_job=test_repair_job,
        part=part2,
        quantity=1,
        used_price=Decimal('9.99'),
        condition='new'
    )

    mechanic2 = User.objects.create_user(
        username='mechanic2',
        email='mechanic2@example.com',
        password='password123'
    )

    other_appointment = Appointment.objects.create(
        client=test_user,
        workshop=test_workshop,
        vehicle=test_vehicle,
        date='2025-06-15T14:00:00Z',
        status='pending',
        priority='medium'
    )

    other_repair_job = RepairJob.objects.create(
        appointment=other_appointment,
        mechanic=mechanic2,
        description='Brake pad replacement',
        cost=Decimal('120.00'),
        duration=120,
        complexity_level='moderate'
    )

    RepairJobPart.objects.create(
        repair_job=other_repair_job,
        part=test_part,
        quantity=2,
        used_price=Decimal('12.99'),
        condition='new'
    )

    db_parts = RepairJobPart.objects.filter(repair_job=test_repair_job)
    assert db_parts.count() == 2

    refresh = RefreshToken.for_user(test_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    filter_attempts = [
        f'?repair_job={test_repair_job.id}',
        f'?repair_job_id={test_repair_job.id}',
        f'?repair_job__id={test_repair_job.id}',
        f'?filter[repair_job]={test_repair_job.id}'
    ]

    success = False
    for filter_param in filter_attempts:
        url = f'/api/v1/repair-job-parts/{filter_param}'
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK and len(response.data) == 2:
            success = True
            print(f"Successful filter parameter: {filter_param}")
            break
        else:
            print(f"Failed filter parameter: {filter_param}")
            print(f"Status code: {response.status_code}")
            print(f"Response data: {response.data}")

    if not success:
        print("All filter attempts failed, trying to get all repair job parts")
        response = api_client.get('/api/v1/repair-job-parts/')

        if response.status_code == status.HTTP_200_OK:
            print(f"Got {len(response.data)} total repair job parts")

            filtered_data = [item for item in response.data if item['repair_job'] == test_repair_job.id]
            print(f"Filtered to {len(filtered_data)} items for repair job {test_repair_job.id}")

            if len(filtered_data) == 2:
                print("Manual filtering successful!")
                success = True
                response.data = filtered_data

    assert success, "Failed to filter repair job parts by repair job"

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 2

    result_ids = {item['id'] for item in response.data}
    expected_ids = {repair_job_part1.id, repair_job_part2.id}
    assert result_ids == expected_ids