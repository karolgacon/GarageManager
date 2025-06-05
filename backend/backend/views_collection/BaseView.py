from rest_framework import viewsets, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.http import Http404
from django.forms import ValidationError
from rest_framework.permissions import IsAuthenticated

class BaseViewSet(viewsets.ViewSet):
    """
    Base ViewSet for common CRUD operations.
    """
    service = None
    serializer_class = None
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all records",
        description="Returns a list of all records.",
        responses={200: "Serializer(many=True)"}
    )
    def list(self, request):
        """List all records."""
        records = self.service.get_all()
        serializer = self.serializer_class(records, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve record details",
        description="Returns details of a specific record.",
        responses={200: "Serializer", 404: OpenApiResponse(description="Record not found")}
    )
    def retrieve(self, request, pk=None):
        """Retrieve details of a specific record."""
        try:
            record = self.service.get_by_id(pk)
            serializer = self.serializer_class(record)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Record not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Create a new record",
        description="Creates a new record.",
        request="Serializer",
        responses={201: "Serializer", 400: OpenApiResponse(description="Validation error")}
    )
    def create(self, request):
        """Create a new record."""
        try:
            record = self.service.create(request.data)
            serializer = self.serializer_class(record)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Update a record",
        description="Updates an existing record.",
        request="Serializer",
        responses={200: "Serializer", 404: OpenApiResponse(description="Record not found")}
    )
    def update(self, request, pk=None):
        """Update an existing record."""
        try:
            record = self.service.update(pk, request.data)
            serializer = self.serializer_class(record)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Record not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Partially update a record",
        description="Partially updates fields of a record.",
        request="Serializer",
        responses={200: "Serializer", 404: OpenApiResponse(description="Record not found")}
    )
    def partial_update(self, request, pk=None):
        """Partially update a record."""
        try:
            record = self.service.partially_update(pk, request.data)
            serializer = self.serializer_class(record)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Record not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Delete a record",
        description="Deletes a record.",
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Record not found")}
    )
    def destroy(self, request, pk=None):
        """Delete a record."""
        try:
            self.service.delete(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response(
                {"error": "Record not found"},
                status=status.HTTP_404_NOT_FOUND
            )