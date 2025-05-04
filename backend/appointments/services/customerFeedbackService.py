from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.customerFeedbackRepository import CustomerFeedbackRepository
from backend.services.baseService import BaseService

class CustomerFeedbackService(BaseService):
    repository = CustomerFeedbackRepository

    @staticmethod
    def get_feedback_by_rating(rating):
        """
        Retrieves customer feedback by its rating.
        """
        try:
            return CustomerFeedbackRepository.get_feedback_by_rating(rating)
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback by rating: {str(e)}")

    @staticmethod
    def get_feedback_by_tag(tag):
        """
        Retrieves customer feedback by its tag.
        """
        try:
            return CustomerFeedbackRepository.get_feedback_by_tag(tag)
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback by tag: {str(e)}")

    @staticmethod
    def get_feedback_with_recommendation(recommendation):
        """
        Retrieves customer feedback with a specific recommendation.
        """
        try:
            return CustomerFeedbackRepository.get_feedback_with_recommendation(recommendation)
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback with recommendation: {str(e)}")

    @staticmethod
    def create_workshop_feedback(data):
        """
        Creates a new workshop feedback entry in the database.
        """
        try:
            return CustomerFeedbackRepository.create_workshop_feedback(data)
        except ValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise RuntimeError(f"Error creating workshop feedback: {str(e)}")