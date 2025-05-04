from backend.views_collection.BaseView import BaseViewSet
from ..services.customerFeedbackService import CustomerFeedbackService
from ..serializers import CustomerFeedbackSerializer
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404

class CustomerFeedbackViewSet(BaseViewSet):
    service = CustomerFeedbackService
    serializer_class = CustomerFeedbackSerializer

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
                feedbacks = self.service.get_feedback_by_rating(rating)
                serializer = self.serializer_class(feedbacks, many=True)
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
                feedbacks = self.service.get_feedback_by_tag(tag)
                serializer = self.serializer_class(feedbacks, many=True)
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
        feedbacks = self.service.get_feedback_with_recommendation(True)
        serializer = self.serializer_class(feedbacks, many=True)
        return Response(serializer.data)