from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from ..serializers import InvoiceSerializer
from ..services.invoiceService import InvoiceService
from django.http import Http404
from django.forms import ValidationError

class InvoiceViewSet(viewsets.ViewSet):
    """
    ViewSet for managing invoices.
    Handles CRUD operations for invoices.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all invoices",
        description="Returns a list of all invoices.",
        responses={200: InvoiceSerializer(many=True)}
    )
    def list(self, request):
        """List all invoices."""
        invoices = InvoiceService.get_all_invoices()
        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve invoice details",
        description="Returns details of a specific invoice.",
        responses={200: InvoiceSerializer, 404: OpenApiResponse(description="Invoice not found")}
    )
    def retrieve(self, request, pk=None):
        """Retrieve details of a specific invoice."""
        try:
            invoice = InvoiceService.get_invoice_by_id(pk)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Invoice not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Create a new invoice",
        description="Creates a new invoice entry.",
        request=InvoiceSerializer,
        responses={201: InvoiceSerializer, 400: OpenApiResponse(description="Validation error")}
    )
    def create(self, request):
        """Create a new invoice."""
        try:
            invoice = InvoiceService.create_invoice(request.data)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Update an invoice",
        description="Updates an existing invoice entry.",
        request=InvoiceSerializer,
        responses={200: InvoiceSerializer, 404: OpenApiResponse(description="Invoice not found")}
    )
    def update(self, request, pk=None):
        """Update an existing invoice."""
        try:
            invoice = InvoiceService.update_invoice(pk, request.data)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Invoice not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Partially update an invoice",
        description="Partially updates fields of an invoice entry.",
        request=InvoiceSerializer,
        responses={200: InvoiceSerializer, 404: OpenApiResponse(description="Invoice not found")}
    )
    def partial_update(self, request, pk=None):
        """Partially update an invoice."""
        try:
            invoice = InvoiceService.partially_update_invoice(pk, request.data)
            serializer = InvoiceSerializer(invoice)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Invoice not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Delete an invoice",
        description="Deletes an invoice entry.",
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Invoice not found")}
    )
    def destroy(self, request, pk=None):
        """Delete an invoice."""
        try:
            InvoiceService.delete_invoice(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response(
                {"error": "Invoice not found"},
                status=status.HTTP_404_NOT_FOUND
            )