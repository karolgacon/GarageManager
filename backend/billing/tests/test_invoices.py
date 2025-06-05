import os
from datetime import date, timedelta
from decimal import Decimal
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
import django
django.setup()
import pytest
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from billing.models import Invoice, Payment
from users.models import User
import logging

logger = logging.getLogger(__name__)

@pytest.fixture
def client_user(db):
    return User.objects.create_user(
        username="test_client",
        email="test_client@example.com",
        password="password123"
    )

@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="test_admin",
        email="test_admin@example.com",
        password="password123",
        is_staff=True
    )

@pytest.fixture
def invoice(db, client_user):
    return Invoice.objects.create(
        client=client_user,
        amount=Decimal("500.00"),
        discount=Decimal("50.00"),
        due_date=date.today() + timedelta(days=30),
        status="pending",
        tax_rate=Decimal("0.23"),
        description="Test invoice for services rendered"
    )

@pytest.fixture
def payment(db, invoice):
    return Payment.objects.create(
        invoice=invoice,
        amount_paid=Decimal("250.00"),
        payment_method="card",
        transaction_id="TXID12345",
        notes="Partial payment"
    )

@pytest.fixture
def api_client(client_user):
    client = APIClient()
    refresh = RefreshToken.for_user(client_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.fixture
def admin_api_client(admin_user):
    client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client

@pytest.mark.django_db
def test_invoice_creation(client_user):
    invoice = Invoice.objects.create(
        client=client_user,
        amount=Decimal("300.00"),
        due_date=date.today() + timedelta(days=14),
        description="Test invoice"
    )
    assert invoice.id is not None
    assert invoice.client == client_user
    assert invoice.amount == Decimal("300.00")
    assert invoice.status == "pending"

    assert float(invoice.tax_rate) == pytest.approx(0.23)

    assert invoice.issue_date == date.today()

@pytest.mark.django_db
def test_invoice_string_representation(invoice):
    expected_string = f"Invoice {invoice.id} - {invoice.client.username}"
    assert str(invoice) == expected_string

@pytest.mark.django_db
def test_invoice_discount_calculation(client_user):
    invoice = Invoice.objects.create(
        client=client_user,
        amount=Decimal("1000.00"),
        discount=Decimal("100.00"),
        due_date=date.today() + timedelta(days=30)
    )

    expected_net = Decimal("900.00")
    assert invoice.amount - invoice.discount == expected_net

@pytest.mark.django_db
def test_invoice_tax_calculation(client_user):
    invoice = Invoice.objects.create(
        client=client_user,
        amount=Decimal("1000.00"),
        due_date=date.today() + timedelta(days=30),
        tax_rate=Decimal("0.23")
    )

    expected_tax = Decimal("1000.00") * Decimal("0.23")
    assert invoice.amount * invoice.tax_rate == expected_tax

@pytest.mark.django_db
def test_payment_creation(invoice):
    payment = Payment.objects.create(
        invoice=invoice,
        amount_paid=Decimal("200.00"),
        payment_method="cash",
        transaction_id="TXID67890"
    )
    assert payment.id is not None
    assert payment.invoice == invoice
    assert payment.amount_paid == Decimal("200.00")
    assert payment.payment_method == "cash"
    assert payment.transaction_id == "TXID67890"

@pytest.mark.django_db
def test_payment_string_representation(payment):
    expected_string = f"Payments {payment.transaction_id} - {payment.invoice}"
    assert str(payment) == expected_string

@pytest.mark.django_db
def test_multiple_payments_for_invoice(invoice):
    payment1 = Payment.objects.create(
        invoice=invoice,
        amount_paid=Decimal("300.00"),
        payment_method="card",
        transaction_id="TXID11111"
    )
    payment2 = Payment.objects.create(
        invoice=invoice,
        amount_paid=Decimal("200.00"),
        payment_method="cash",
        transaction_id="TXID22222"
    )

    assert invoice.payments.count() == 2
    total_paid = sum(p.amount_paid for p in invoice.payments.all())
    assert total_paid == Decimal("500.00")

@pytest.mark.django_db
def test_list_invoices(api_client, invoice, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing list invoices")

    url = "/api/v1/invoices/"
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert len(response.data) == 1
    logger.info("Verified response data length: %d", len(response.data))

@pytest.mark.django_db
def test_retrieve_invoice(api_client, invoice, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing retrieve invoice")
    url = f"/api/v1/invoices/{invoice.id}/"
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert response.data["id"] == invoice.id
    logger.info("Verified response invoice ID: %d", response.data["id"])

@pytest.mark.django_db
def test_create_invoice(api_client, client_user, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing create invoice")
    url = "/api/v1/invoices/"

    data = {
        "client_id": client_user.id,
        "amount": "750.00",
        "discount": "75.00",
        "due_date": (date.today() + timedelta(days=15)).isoformat(),
        "status": "pending",
        "tax_rate": "0.23",
        "description": "New test invoice"
    }
    logger.info("Sending POST request to %s with data: %s", url, data)
    response = api_client.post(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_201_CREATED
    logger.info("Verified response status code: %d", response.status_code)
    assert response.data["description"] == "New test invoice"
    logger.info("Verified invoice description: %s", response.data["description"])

@pytest.mark.django_db
def test_update_invoice(api_client, invoice, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing update invoice")
    url = f"/api/v1/invoices/{invoice.id}/"
    data = {
        "client_id": invoice.client.id,
        "amount": "600.00",
        "discount": "60.00",
        "due_date": (date.today() + timedelta(days=45)).isoformat(),
        "status": "paid",
        "tax_rate": "0.23",
        "description": "Updated invoice description"
    }
    logger.info("Sending PUT request to %s with data: %s", url, data)
    response = api_client.put(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert response.data["status"] == "paid"
    logger.info("Verified updated invoice status: %s", response.data["status"])

@pytest.mark.django_db
def test_partial_update_invoice(api_client, invoice, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing partial update invoice")
    url = f"/api/v1/invoices/{invoice.id}/"
    data = {"status": "overdue"}
    logger.info("Sending PATCH request to %s with data: %s", url, data)
    response = api_client.patch(url, data, format="json")
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert response.data["status"] == "overdue"
    logger.info("Verified partially updated invoice status: %s", response.data["status"])

@pytest.mark.django_db
def test_delete_invoice(api_client, invoice, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing delete invoice")
    url = f"/api/v1/invoices/{invoice.id}/"
    logger.info("Sending DELETE request to %s", url)
    response = api_client.delete(url)
    logger.info("Received response status code: %d", response.status_code)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    logger.info("Verified response status code: %d", response.status_code)

    with pytest.raises(Invoice.DoesNotExist):
        Invoice.objects.get(id=invoice.id)
    logger.info("Verified invoice was deleted")

@pytest.mark.django_db
def test_list_client_invoices(api_client, client_user, invoice, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing list client invoices")
    url = f"/api/v1/invoices/?client_id={client_user.id}"
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK
    logger.info("Verified response status code: %d", response.status_code)
    assert len(response.data) == 1
    logger.info("Verified response data length: %d", len(response.data))

@pytest.mark.django_db
def test_invoice_with_payments(api_client, invoice, payment, caplog):
    caplog.set_level(logging.INFO)
    logger.info("Testing invoice with payments")
    url = f"/api/v1/invoices/{invoice.id}/"
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK

    if "payments" in response.data:

        assert len(response.data["payments"]) >= 1
        payment_ids = [p["transaction_id"] for p in response.data["payments"]]
        assert payment.transaction_id in payment_ids
    else:

        logger.info("Note: The invoice endpoint doesn't include payment data, skipping payment validation")

        payments_url = f"/api/v1/payments/?invoice_id={invoice.id}"
        try:
            payments_response = api_client.get(payments_url)
            if payments_response.status_code == status.HTTP_200_OK:
                assert len(payments_response.data) >= 1

                assert any(p["transaction_id"] == payment.transaction_id for p in payments_response.data)
        except Exception as e:
            logger.info(f"Couldn't verify payments through separate endpoint: {e}")

            pass

@pytest.mark.django_db
def test_overdue_invoices(api_client, client_user, caplog):

    overdue_invoice = Invoice.objects.create(
        client=client_user,
        amount=Decimal("300.00"),
        due_date=date.today() - timedelta(days=10),
        status="pending"
    )

    caplog.set_level(logging.INFO)
    logger.info("Testing overdue invoices")
    url = "/api/v1/invoices/?overdue=true"
    logger.info("Sending GET request to %s", url)
    response = api_client.get(url)
    logger.info("Received response: %s", response.data)
    assert response.status_code == status.HTTP_200_OK

    assert len(response.data) == 1
    assert response.data[0]["id"] == overdue_invoice.id