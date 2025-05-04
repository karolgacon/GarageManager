from ..models import CustomerFeedback
from backend.repositories.baseRepository import BaseRepository

class CustomerFeedbackRepository(BaseRepository):
    model = CustomerFeedback

    @staticmethod
    def get_feedback_by_rating(rating):
        """
        Retrieves customer feedback by its rating.
        """
        try:
            return CustomerFeedback.objects.filter(rating=rating)
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback by rating: {str(e)}")

    @staticmethod
    def get_feedback_by_tag(tag):
        """
        Retrieves customer feedback by its tag.
        """
        try:
            return CustomerFeedback.objects.filter(tag=tag)
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback by tag: {str(e)}")

    @staticmethod
    def get_feedback_with_recommendation(recommendation):
        """
        Retrieves customer feedback with a specific recommendation.
        """
        try:
            return CustomerFeedback.objects.filter(recommendation=recommendation)
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback with recommendation: {str(e)}")