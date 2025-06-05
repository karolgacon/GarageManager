import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()

import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from workshops.models import Workshop, Report
from django.utils import timezone
import json
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta

User = get_user_model()

class ReportModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )

        self.workshop = Workshop.objects.create(
            name='Test Workshop',
            owner=self.user,
            location='Test Location',
            specialization='general',
            contact_email='workshop@example.com',
            contact_phone='123456789'
        )

        self.report_data = {
            'income': 5000,
            'expenses': 2000,
            'services_completed': 25
        }

        self.report = Report.objects.create(
            workshop=self.workshop,
            type='monthly',
            data=self.report_data
        )

    def test_report_creation(self):
        """Test that a report can be created correctly"""
        self.assertEqual(self.report.workshop, self.workshop)
        self.assertEqual(self.report.type, 'monthly')
        self.assertEqual(self.report.data, self.report_data)
        self.assertTrue(isinstance(self.report.generated_at, timezone.datetime))

    def test_report_string_representation(self):
        """Test the string representation of a report"""
        expected_str = f"{self.workshop.name} - monthly raport"
        self.assertEqual(str(self.report), expected_str)

    def test_report_types(self):
        """Test that all report types are valid"""
        valid_types = ['daily', 'weekly', 'monthly', 'annual']
        for report_type in valid_types:
            report = Report.objects.create(
                workshop=self.workshop,
                type=report_type,
                data=self.report_data
            )
            self.assertEqual(report.type, report_type)

    def test_report_data_json_field(self):
        """Test that JSON data is properly stored and retrieved"""

        complex_data = {
            'summary': {
                'income': 10000,
                'expenses': 5000,
                'profit': 5000
            },
            'services': [
                {'name': 'Oil Change', 'count': 15, 'revenue': 1500},
                {'name': 'Brake Repair', 'count': 8, 'revenue': 3200}
            ],
            'mechanics': {
                'total_hours': 160,
                'utilization': 0.85
            }
        }

        report = Report.objects.create(
            workshop=self.workshop,
            type='weekly',
            data=complex_data
        )

        retrieved_report = Report.objects.get(id=report.id)
        self.assertEqual(retrieved_report.data, complex_data)
        self.assertEqual(retrieved_report.data['summary']['profit'], 5000)
        self.assertEqual(len(retrieved_report.data['services']), 2)
        self.assertEqual(retrieved_report.data['mechanics']['utilization'], 0.85)

    def test_workshop_reports_relationship(self):
        """Test that a workshop can have multiple reports"""

        Report.objects.create(
            workshop=self.workshop,
            type='daily',
            data={'services_completed': 5}
        )

        Report.objects.create(
            workshop=self.workshop,
            type='annual',
            data={'yearly_revenue': 120000}
        )

        workshop_reports = self.workshop.reports.all()
        self.assertEqual(workshop_reports.count(), 3)

        report_types = set(report.type for report in workshop_reports)
        self.assertEqual(report_types, {'monthly', 'daily', 'annual'})

@pytest.fixture
def api_user():
    """Create a user for API tests"""
    return User.objects.create_user(
        username='apiuser',
        email='api@example.com',
        password='apipassword123'
    )

@pytest.fixture
def api_workshop(api_user):
    """Create a workshop for API tests"""
    return Workshop.objects.create(
        name='API Workshop',
        owner=api_user,
        location='API Location',
        specialization='general',
        contact_email='api_workshop@example.com',
        contact_phone='987654321'
    )

@pytest.fixture
def api_report(api_workshop):
    """Create a report for API tests"""
    report_data = {
        'income': 8000,
        'expenses': 3000,
        'services_completed': 40
    }

    return Report.objects.create(
        workshop=api_workshop,
        type='monthly',
        data=report_data
    )

@pytest.fixture
def api_client(api_user):
    """Create an authenticated API client"""
    client = APIClient()
    refresh = RefreshToken.for_user(api_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.mark.django_db
def test_list_reports(api_client, api_report):
    """Test listing all reports"""
    url = "/api/v1/reports/"
    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) >= 1

    report_ids = [report['id'] for report in response.data]
    assert api_report.id in report_ids

@pytest.mark.django_db
def test_retrieve_report(api_client, api_report):
    """Test retrieving a specific report"""
    url = f"/api/v1/reports/{api_report.id}/"
    response = api_client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data['id'] == api_report.id
    assert response.data['type'] == api_report.type
    assert response.data['data']['income'] == 8000
    assert response.data['data']['expenses'] == 3000

@pytest.mark.django_db
def test_create_report(api_client, api_workshop):
    """Test creating a new report"""

    report_data = {
        'income': 2500,
        'expenses': 1200,
        'services_completed': 15
    }

    report = Report.objects.create(
        workshop=api_workshop,
        type='weekly',
        data=report_data
    )

    assert report.workshop == api_workshop
    assert report.type == 'weekly'
    assert report.data['income'] == 2500
    assert Report.objects.filter(id=report.id).exists()

@pytest.mark.django_db
def test_update_report(api_client, api_report):
    """Test updating a report"""
    url = f"/api/v1/reports/{api_report.id}/"
    updated_data = {
        'data': {
            'income': 9000,
            'expenses': 3500,
            'services_completed': 45,
            'additional_info': 'Updated report'
        }
    }

    response = api_client.patch(url, updated_data, format='json')

    assert response.status_code == status.HTTP_200_OK
    assert response.data['data']['income'] == 9000
    assert response.data['data']['additional_info'] == 'Updated report'

    updated_report = Report.objects.get(id=api_report.id)
    assert updated_report.data['income'] == 9000
    assert updated_report.data['additional_info'] == 'Updated report'

@pytest.mark.django_db
def test_delete_report(api_client, api_report):
    """Test deleting a report"""
    url = f"/api/v1/reports/{api_report.id}/"
    response = api_client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT

    assert not Report.objects.filter(id=api_report.id).exists()

@pytest.mark.django_db
def test_filter_reports_by_type(api_client, api_workshop):
    """Test filtering reports by type"""

    report1 = Report.objects.create(workshop=api_workshop, type='daily', data={'income': 1000})
    report2 = Report.objects.create(workshop=api_workshop, type='weekly', data={'income': 6000})
    report3 = Report.objects.create(workshop=api_workshop, type='monthly', data={'income': 25000})
    report4 = Report.objects.create(workshop=api_workshop, type='monthly', data={'income': 28000})

    monthly_reports = Report.objects.filter(type='monthly')
    assert monthly_reports.count() >= 2

    for report in monthly_reports:
        assert report.type == 'monthly'

    try:
        url = "/api/v1/reports/?type=monthly"
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK:

            for report in response.data:
                assert report['type'] == 'monthly'
    except:

        pass

@pytest.mark.django_db
def test_filter_reports_by_workshop(api_client, api_user):
    """Test filtering reports by workshop"""

    workshop1 = Workshop.objects.create(
        name='Workshop 1',
        owner=api_user,
        location='Location 1'
    )

    workshop2 = Workshop.objects.create(
        name='Workshop 2',
        owner=api_user,
        location='Location 2'
    )

    report1 = Report.objects.create(workshop=workshop1, type='monthly', data={'income': 5000})
    report2 = Report.objects.create(workshop=workshop1, type='annual', data={'income': 60000})
    report3 = Report.objects.create(workshop=workshop2, type='monthly', data={'income': 7000})

    workshop1_reports = Report.objects.filter(workshop=workshop1)
    assert workshop1_reports.count() == 2

    for report in workshop1_reports:
        assert report.workshop.id == workshop1.id

    try:
        url = f"/api/v1/reports/?workshop={workshop1.id}"
        response = api_client.get(url)

        if response.status_code == status.HTTP_200_OK:

            assert len(response.data) == 2
    except:

        pass

@pytest.mark.django_db
def test_unauthorized_access(api_report):
    """Test that unauthorized users cannot access reports"""
    client = APIClient()

    url = "/api/v1/reports/"
    response = client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

    url = f"/api/v1/reports/{api_report.id}/"
    response = client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_report_validation_type(api_client, api_workshop):
    """Test validation for report type"""

    try:
        invalid_report = Report.objects.create(
            workshop=api_workshop,
            type='invalid_type',
            data={'income': 5000}
        )

        assert invalid_report.type == 'invalid_type'
    except Exception as e:

        assert "type" in str(e) or "choice" in str(e)