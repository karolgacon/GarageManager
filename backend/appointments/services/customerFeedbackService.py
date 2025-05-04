from django.http import Http404
from django.core.exceptions import ValidationError
from ..repositories.customerFeedbackRepository import CustomerFeedbackRepository

class CustomerFeedbackService:
    @staticmethod
    def get_all_feedback():
        """
        Retrieves all customer feedback from the database.
        """
        try:
            return CustomerFeedbackRepository.get_all_feedback()
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback: {str(e)}")

    @staticmethod
    def create_feedback(data):
        """
        Creates a new customer feedback entry in the database.
        """
        try:
            return CustomerFeedbackRepository.create_feedback(data)
        except ValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise RuntimeError(f"Error creating customer feedback: {str(e)}")

    @staticmethod
    def get_feedback_by_id(feedback_id):
        """
        Retrieves customer feedback by its ID.
        """
        try:
            return CustomerFeedbackRepository.get_feedback_by_id(feedback_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving customer feedback: {str(e)}")

    @staticmethod
    def delete_feedback(feedback_id):
        """
        Deletes customer feedback by its ID.
        """
        try:
            return CustomerFeedbackRepository.delete_feedback(feedback_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error deleting customer feedback: {str(e)}")

    @staticmethod
    def update_feedback(feedback_id, data):
        """
        Updates an existing customer feedback entry.
        """
        try:
            return CustomerFeedbackRepository.update_feedback(feedback_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error updating customer feedback: {str(e)}")

    @staticmethod
    def partially_update_feedback(feedback_id, data):
        """
        Partially updates an existing customer feedback entry.
        """
        try:
            return CustomerFeedbackRepository.partially_update_feedback(feedback_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error partially updating customer feedback: {str(e)}")

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