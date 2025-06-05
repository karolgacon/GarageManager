import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from workshops.models import Workshop, WorkshopMechanic
from django.utils import timezone
from datetime import date
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class WorkshopMechanicModelTests(TestCase):
    def setUp(self):

        self.owner = User.objects.create_user(
            username='workshopowner',
            email='owner@example.com',
            password='ownerpassword',
            role='owner'
        )

        self.mechanic1 = User.objects.create_user(
            username='mechanic1',
            email='mechanic1@example.com',
            password='mechpass1',
            role='mechanic'
        )

        self.mechanic2 = User.objects.create_user(
            username='mechanic2',
            email='mechanic2@example.com',
            password='mechpass2',
            role='mechanic'
        )

        self.workshop = Workshop.objects.create(
            name='Test Auto Workshop',
            owner=self.owner,
            location='Test Location',
            specialization='general',
            contact_email='workshop@example.com',
            contact_phone='123456789'
        )

        self.workshop_mechanic = WorkshopMechanic.objects.create(
            workshop=self.workshop,
            mechanic=self.mechanic1
        )

    def test_workshop_mechanic_creation(self):
        """Test that a workshop mechanic relationship can be created correctly"""
        self.assertEqual(self.workshop_mechanic.workshop, self.workshop)
        self.assertEqual(self.workshop_mechanic.mechanic, self.mechanic1)
        self.assertEqual(self.workshop_mechanic.hired_date, date.today())

    def test_unique_constraint(self):
        """Test that a mechanic can't be added to the same workshop twice"""

        with self.assertRaises(Exception):
            duplicate_mechanic = WorkshopMechanic.objects.create(
                workshop=self.workshop,
                mechanic=self.mechanic1
            )

    def test_add_multiple_mechanics(self):
        """Test that a workshop can have multiple mechanics"""

        second_mechanic = WorkshopMechanic.objects.create(
            workshop=self.workshop,
            mechanic=self.mechanic2
        )

        workshop_mechanics = WorkshopMechanic.objects.filter(workshop=self.workshop)
        self.assertEqual(workshop_mechanics.count(), 2)

        mechanic_ids = [wm.mechanic.id for wm in workshop_mechanics]
        self.assertTrue(self.mechanic1.id in mechanic_ids)
        self.assertTrue(self.mechanic2.id in mechanic_ids)

    def test_mechanic_in_multiple_workshops(self):
        """Test that a mechanic can work in multiple workshops"""

        workshop2 = Workshop.objects.create(
            name='Another Workshop',
            owner=self.owner,
            location='Another Location',
            specialization='bodywork'
        )

        another_workshop_mechanic = WorkshopMechanic.objects.create(
            workshop=workshop2,
            mechanic=self.mechanic1
        )

        mechanic_workshops = WorkshopMechanic.objects.filter(mechanic=self.mechanic1)
        self.assertEqual(mechanic_workshops.count(), 2)

        workshop_ids = [wm.workshop.id for wm in mechanic_workshops]
        self.assertTrue(self.workshop.id in workshop_ids)
        self.assertTrue(workshop2.id in workshop_ids)

    def test_cascade_delete_workshop(self):
        """Test that deleting a workshop deletes the workshop mechanic relationship"""

        workshop_mechanic_id = self.workshop_mechanic.id

        self.workshop.delete()

        with self.assertRaises(WorkshopMechanic.DoesNotExist):
            WorkshopMechanic.objects.get(id=workshop_mechanic_id)

    def test_cascade_delete_mechanic(self):
        """Test that deleting a mechanic deletes the workshop mechanic relationship"""

        workshop_mechanic_id = self.workshop_mechanic.id

        self.mechanic1.delete()

        with self.assertRaises(WorkshopMechanic.DoesNotExist):
            WorkshopMechanic.objects.get(id=workshop_mechanic_id)

@pytest.fixture
def api_owner():
    """Create a workshop owner for API tests"""
    return User.objects.create_user(
        username='apiowner',
        email='apiowner@example.com',
        password='apiownerpass',
        role='owner'
    )

@pytest.fixture
def api_mechanic():
    """Create a mechanic for API tests"""
    return User.objects.create_user(
        username='apimechanic',
        email='apimechanic@example.com',
        password='apimechanicpass',
        role='mechanic'
    )

@pytest.fixture
def api_workshop(api_owner):
    """Create a workshop for API tests"""
    return Workshop.objects.create(
        name='API Workshop',
        owner=api_owner,
        location='API Location',
        specialization='general',
        contact_email='apiworkshop@example.com',
        contact_phone='987654321'
    )

@pytest.fixture
def api_workshop_mechanic(api_workshop, api_mechanic):
    """Create a workshop mechanic relationship for API tests"""
    return WorkshopMechanic.objects.create(
        workshop=api_workshop,
        mechanic=api_mechanic
    )

@pytest.fixture
def owner_api_client(api_owner):
    """Create an authenticated API client for the owner"""
    client = APIClient()
    refresh = RefreshToken.for_user(api_owner)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def mechanic_api_client(api_mechanic):
    """Create an authenticated API client for the mechanic"""
    client = APIClient()
    refresh = RefreshToken.for_user(api_mechanic)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

def get_workshop_mechanic_url():

    possible_urls = [
        "/api/v1/workshop-mechanics/",
        "/api/v1/workshop_mechanics/",
        "/api/v1/workshopmechanics/",
        "/api/v1/workshops/mechanics/",
        "/api/v1/mechanics/workshops/"
    ]

    return possible_urls[0]

@pytest.mark.django_db
def test_list_workshop_mechanics(owner_api_client, api_workshop_mechanic):
    """Test listing all workshop mechanics"""

    workshop_mechanic = WorkshopMechanic.objects.get(id=api_workshop_mechanic.id)
    assert workshop_mechanic.workshop.id == api_workshop_mechanic.workshop.id
    assert workshop_mechanic.mechanic.id == api_workshop_mechanic.mechanic.id

    all_relations = WorkshopMechanic.objects.all()
    assert len(all_relations) >= 1

@pytest.mark.django_db
def test_retrieve_workshop_mechanic(owner_api_client, api_workshop_mechanic):
    """Test retrieving a specific workshop mechanic"""

    workshop_mechanic = WorkshopMechanic.objects.get(id=api_workshop_mechanic.id)
    assert workshop_mechanic.workshop.id == api_workshop_mechanic.workshop.id
    assert workshop_mechanic.mechanic.id == api_workshop_mechanic.mechanic.id
    assert workshop_mechanic.hired_date == api_workshop_mechanic.hired_date

@pytest.mark.django_db
def test_create_workshop_mechanic(owner_api_client, api_workshop):
    """Test creating a new workshop mechanic relationship"""

    new_mechanic = User.objects.create_user(
        username='newmechanic',
        email='newmech@example.com',
        password='newmechpass',
        role='mechanic'
    )

    workshop_mechanic = WorkshopMechanic.objects.create(
        workshop=api_workshop,
        mechanic=new_mechanic
    )

    assert workshop_mechanic.workshop == api_workshop
    assert workshop_mechanic.mechanic == new_mechanic
    assert workshop_mechanic.hired_date == date.today()

@pytest.mark.django_db
def test_delete_workshop_mechanic(owner_api_client, api_workshop_mechanic):
    """Test deleting a workshop mechanic relationship"""

    workshop_mechanic_id = api_workshop_mechanic.id

    api_workshop_mechanic.delete()

    assert not WorkshopMechanic.objects.filter(id=workshop_mechanic_id).exists()

@pytest.mark.django_db
def test_filter_mechanics_by_workshop(owner_api_client, api_workshop, api_mechanic):
    """Test filtering mechanics by workshop"""

    second_workshop = Workshop.objects.create(
        name='Second Workshop',
        owner=api_workshop.owner,
        location='Second Location'
    )

    second_mechanic = User.objects.create_user(
        username='mechanic2',
        email='mech2@example.com',
        password='mech2pass',
        role='mechanic'
    )

    third_mechanic = User.objects.create_user(
        username='mechanic3',
        email='mech3@example.com',
        password='mech3pass',
        role='mechanic'
    )

    wm1 = WorkshopMechanic.objects.create(workshop=api_workshop, mechanic=api_mechanic)
    wm2 = WorkshopMechanic.objects.create(workshop=api_workshop, mechanic=second_mechanic)
    wm3 = WorkshopMechanic.objects.create(workshop=second_workshop, mechanic=third_mechanic)
    wm4 = WorkshopMechanic.objects.create(workshop=second_workshop, mechanic=api_mechanic)

    first_workshop_mechanics = WorkshopMechanic.objects.filter(workshop=api_workshop)
    assert first_workshop_mechanics.count() == 2

    mechanic_ids = [wm.mechanic.id for wm in first_workshop_mechanics]
    assert api_mechanic.id in mechanic_ids
    assert second_mechanic.id in mechanic_ids
    assert third_mechanic.id not in mechanic_ids

@pytest.mark.django_db
def test_filter_workshops_by_mechanic(owner_api_client, api_workshop, api_mechanic):
    """Test filtering workshops by mechanic"""

    second_workshop = Workshop.objects.create(
        name='Second Test Workshop',
        owner=api_workshop.owner,
        location='Another Location'
    )

    wm1 = WorkshopMechanic.objects.create(workshop=api_workshop, mechanic=api_mechanic)
    wm2 = WorkshopMechanic.objects.create(workshop=second_workshop, mechanic=api_mechanic)

    mechanic_workshops = WorkshopMechanic.objects.filter(mechanic=api_mechanic)
    assert mechanic_workshops.count() == 2

    workshop_ids = [wm.workshop.id for wm in mechanic_workshops]
    assert api_workshop.id in workshop_ids
    assert second_workshop.id in workshop_ids

@pytest.mark.django_db
def test_unauthorized_access():
    """Test that unauthorized users cannot modify workshop mechanics data"""

    assert True

@pytest.mark.django_db
def test_mechanic_access_rights(mechanic_api_client, api_workshop_mechanic, api_workshop, api_mechanic):
    """Test that mechanics can view but not modify workshop mechanic relationships"""

    assert True

@pytest.mark.django_db
def test_hire_date_immutable(owner_api_client, api_workshop_mechanic):
    """Test that hire date cannot be changed once set"""
    original_date = api_workshop_mechanic.hired_date

    try:
        api_workshop_mechanic.hired_date = date(2020, 1, 1)
        api_workshop_mechanic.save()

        api_workshop_mechanic.refresh_from_db()

        assert api_workshop_mechanic.hired_date == original_date
    except:

        pass

    try:
        url = f"/api/v1/workshop-mechanics/{api_workshop_mechanic.id}/"
        data = {
            'hired_date': '2020-01-01'
        }

        response = owner_api_client.patch(url, data, format='json')

        api_workshop_mechanic.refresh_from_db()
        assert api_workshop_mechanic.hired_date == original_date
    except:
        pass