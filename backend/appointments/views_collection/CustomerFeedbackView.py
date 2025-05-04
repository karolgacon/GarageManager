from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes
from ..serializers import CustomerFeedbackSerializer
from ..services.customerFeedbackService import CustomerFeedbackService
from django.http import Http404
from django.forms import ValidationError

class CustomerFeedbackViewSet(viewsets.ViewSet):
    """
    ViewSet for managing customer feedback.
    Handles CRUD operations for customer feedback.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List all customer feedback",
        description="Returns a list of all customer feedback.",
        responses={200: CustomerFeedbackSerializer(many=True)}
    )
    def list(self, request):
        """List all customer feedback."""
        feedbacks = CustomerFeedbackService.get_all_feedback()
        serializer = CustomerFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Retrieve customer feedback details",
        description="Returns details of a specific customer feedback.",
        responses={200: CustomerFeedbackSerializer, 404: OpenApiResponse(description="Feedback not found")}
    )
    def retrieve(self, request, pk=None):
        """Retrieve details of a specific customer feedback."""
        try:
            feedback = CustomerFeedbackService.get_feedback_by_id(pk)
            serializer = CustomerFeedbackSerializer(feedback)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Feedback not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Create a new customer feedback",
        description="Creates a new customer feedback entry.",
        request=CustomerFeedbackSerializer,
        responses={201: CustomerFeedbackSerializer, 400: OpenApiResponse(description="Validation error")}
    )
    def create(self, request):
        """Create a new customer feedback."""
        try:
            feedback = CustomerFeedbackService.create_feedback(request.data)
            serializer = CustomerFeedbackSerializer(feedback)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Update customer feedback",
        description="Updates an existing customer feedback entry.",
        request=CustomerFeedbackSerializer,
        responses={200: CustomerFeedbackSerializer, 404: OpenApiResponse(description="Feedback not found")}
    )
    def update(self, request, pk=None):
        """Update an existing customer feedback."""
        try:
            feedback = CustomerFeedbackService.update_feedback(pk, request.data)
            serializer = CustomerFeedbackSerializer(feedback)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Feedback not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Partially update customer feedback",
        description="Partially updates fields of a customer feedback entry.",
        request=CustomerFeedbackSerializer,
        responses={200: CustomerFeedbackSerializer, 404: OpenApiResponse(description="Feedback not found")}
    )
    def partial_update(self, request, pk=None):
        """Partially update a customer feedback."""
        try:
            feedback = CustomerFeedbackService.partially_update_feedback(pk, request.data)
            serializer = CustomerFeedbackSerializer(feedback)
            return Response(serializer.data)
        except Http404:
            return Response(
                {"error": "Feedback not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {"error": e.message_dict},
                status=status.HTTP_400_BAD_REQUEST
            )

    @extend_schema(
        summary="Delete customer feedback",
        description="Deletes a customer feedback entry.",
        responses={204: OpenApiResponse(description="No content"), 404: OpenApiResponse(description="Feedback not found")}
    )
    def destroy(self, request, pk=None):
        """Delete a customer feedback."""
        try:
            CustomerFeedbackService.delete_feedback(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Http404:
            return Response(
                {"error": "Feedback not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        summary="Retrieve feedback by rating",
        description="Returns a list of feedback with a specific rating.",
        parameters=[OpenApiParameter(name="rating", description="Rating of the feedback", required=True, type=int)],
        responses={200: CustomerFeedbackSerializer(many=True), 404: OpenApiResponse(description="No feedback found")}
    )
    @action(detail=False, methods=['get'])
    def by_rating(self, request):
        """Retrieve feedback by rating."""
        rating = request.query_params.get('rating')
        if rating:
            try:
                feedbacks = CustomerFeedbackService.get_feedback_by_rating(rating)
                serializer = CustomerFeedbackSerializer(feedbacks, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No feedback found with the specified rating."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'rating' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Retrieve feedback by tag",
        description="Returns a list of feedback containing a specific tag.",
        parameters=[OpenApiParameter(name="tag", description="Tag of the feedback", required=True, type=str)],
        responses={200: CustomerFeedbackSerializer(many=True), 404: OpenApiResponse(description="No feedback found")}
    )
    @action(detail=False, methods=['get'])
    def by_tag(self, request):
        """Retrieve feedback by tag."""
        tag = request.query_params.get('tag')
        if tag:
            try:
                feedbacks = CustomerFeedbackService.get_feedback_by_tag(tag)
                serializer = CustomerFeedbackSerializer(feedbacks, many=True)
                return Response(serializer.data)
            except Http404:
                return Response(
                    {"error": "No feedback found with the specified tag."},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(
            {"error": "The 'tag' parameter is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        summary="Retrieve feedback with recommendation",
        description="Returns a list of feedback with a positive recommendation.",
        responses={200: CustomerFeedbackSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def recommended(self, request):
        """Retrieve feedback with a positive recommendation."""
        feedbacks = CustomerFeedbackService.get_feedback_with_recommendation(True)
        serializer = CustomerFeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)