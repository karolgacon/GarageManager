import os
from datetime import date, timedelta
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

from ..models import Payment, Invoice
from ..serializers import PaymentSerializer
from users.models import User

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
def test_invoice(test_user):
    return Invoice.objects.create(
        client=test_user,
        amount=Decimal('100.00'),
        due_date=date.today() + timedelta(days=14),
        status='pending'
    )

@pytest.fixture
def test_payment(test_invoice):
    return Payment.objects.create(
        invoice=test_invoice,
        amount_paid=Decimal('50.00'),
        payment_method='cash',
        transaction_id=str(uuid.uuid4())[:100],
        notes='Test payment'
    )

@pytest.mark.django_db
def test_list_payments(api_client, test_user):
    url = '/api/v1/payments/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.django_db
def test_create_payment(api_client, test_user, test_invoice):
    url = '/api/v1/payments/'
    api_client.force_authenticate(user=test_user)
    payment_data = {
        'invoice': test_invoice.id,
        'amount_paid': '75.00',
        'payment_method': 'card',
        'transaction_id': str(uuid.uuid4())[:100],
        'notes': 'New test payment'
    }

    response = api_client.post(url, payment_data, format='json')
    assert response.status_code == status.HTTP_201_CREATED

    payments = Payment.objects.all()
    assert payments.count() == 1
    payment = payments.first()
    assert payment.amount_paid == Decimal('75.00')
    assert payment.invoice.id == test_invoice.id

@pytest.mark.django_db
def test_retrieve_payment(api_client, test_user, test_payment):
    url = f'/api/v1/payments/{test_payment.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK

    assert response.data['id'] == test_payment.id
    assert Decimal(response.data['amount_paid']) == test_payment.amount_paid
    assert response.data['payment_method'] == test_payment.payment_method

@pytest.mark.django_db
def test_update_payment(api_client, test_user, test_payment):
    url = f'/api/v1/payments/{test_payment.id}/'
    api_client.force_authenticate(user=test_user)

    updated_data = {
        'invoice': test_payment.invoice.id,
        'amount_paid': '60.00',
        'payment_method': 'online',
        'transaction_id': test_payment.transaction_id,
        'notes': 'Updated payment'
    }

    response = api_client.put(url, updated_data, format='json')
    assert response.status_code == status.HTTP_200_OK

    test_payment.refresh_from_db()
    assert test_payment.amount_paid == Decimal('60.00')
    assert test_payment.payment_method == 'online'

@pytest.mark.django_db
def test_delete_payment(api_client, test_user, test_payment):
    url = f'/api/v1/payments/{test_payment.id}/'
    api_client.force_authenticate(user=test_user)
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Payment.objects.count() == 0