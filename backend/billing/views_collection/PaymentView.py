from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from ..serializers import PaymentSerializer
from ..services.paymentService import PaymentService
from django.http import Http404
from django.forms import ValidationError

class PaymentViewSet(viewsets.ViewSet):
    """
    ViewSet for managing payments.
    Handles CRUD operations for payments.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all payments",
        description="Returns a list of all payments.",
        responses={200: PaymentSerializer(many=True)}
    )
    def list(self, request):
        """List all payments."""
        payments = PaymentService.get_all_payments()
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve payment details",
        description="Returns details of a specific payment.",
        responses={200: PaymentSerializer, 404: OpenApiResponse(description="Payment not found")}
    )
    def retrieve(self, request, pk=None):
        """Retrieve details of a specific payment."""
        try:
            payment = PaymentService.get_payment_by_id(pk)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Create a new payment",
        description="Creates a new payment entry.",
        request=PaymentSerializer,
        responses={201: PaymentSerializer, 400: OpenApiResponse(description="Validation error")}
    )
    def create(self, request):
        """Create a new payment."""
        try:
            payment = PaymentService.create_payment(request.data)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Update a payment",
        description="Updates an existing payment entry.",
        request=PaymentSerializer,
        responses={200: PaymentSerializer, 404: OpenApiResponse(description="Payment not found")}
    )
    def update(self, request, pk=None):
        """Update an existing payment."""
        try:
            payment = PaymentService.update_payment(pk, request.data)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Partially update a payment",
        description="Partially updates fields of a payment entry.",
        request=PaymentSerializer,
        responses={200: PaymentSerializer, 404: OpenApiResponse(description="Payment not found")}
    )
    def partial_update(self, request, pk=None):
        """Partially update a payment."""
        try:
            payment = PaymentService.partially_update_payment(pk, request.data)
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Delete a payment",
        description="Deletes a payment entry.",
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Payment not found")}
    )
    def destroy(self, request, pk=None):
        """Delete a payment."""
        try:
            PaymentService.delete_payment(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response(
                {"error": "Payment not found"},
                status=status.HTTP_404_NOT_FOUND
            )