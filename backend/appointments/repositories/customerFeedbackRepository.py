from ..models import CustomerFeedback

class CustomerFeedbackRepository:
    @staticmethod
    def get_all_feedback():
        """
        Retrieves all customer feedback from the database.
        """
        try:
            feedback = CustomerFeedback.objects.all()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving customer feedback: {str(e)}")
        return feedback
    
    @staticmethod
    def create_feedback(data):
        """
        Creates a new customer feedback entry in the database.
        """
        try:
            feedback = CustomerFeedback.objects.create(**data)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error creating customer feedback: {str(e)}")
        return feedback
    
    @staticmethod
    def get_feedback_by_id(feedback_id):
        """
        Retrieves customer feedback by its ID.
        """
        try:
            feedback = CustomerFeedback.objects.filter(id=feedback_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving customer feedback: {str(e)}")
        if not feedback:
            raise ValueError(f"Customer feedback with ID {feedback_id} does not exist.")
        return feedback
    
    @staticmethod
    def delete_feedback(feedback_id):
        """
        Deletes customer feedback by its ID.
        """
        try:
            feedback = CustomerFeedback.objects.filter(id=feedback_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error deleting customer feedback: {str(e)}")
        if not feedback:
            raise ValueError(f"Customer feedback with ID {feedback_id} does not exist.")
        feedback.delete()
        return True
    
    @staticmethod
    def update_feedback(feedback_id, data):
        """
        Updates an existing customer feedback entry.
        """
        try:
            feedback = CustomerFeedback.objects.filter(id=feedback_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error updating customer feedback: {str(e)}")
        if not feedback:
            raise ValueError(f"Customer feedback with ID {feedback_id} does not exist.")
        for key, value in data.items():
            setattr(feedback, key, value)
        feedback.save()
        return feedback 
    
    @staticmethod
    def partially_update_feedback(feedback_id, data):
        """
        Partially updates an existing customer feedback entry.
        """
        try:
            feedback = CustomerFeedback.objects.filter(id=feedback_id).first()
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error partially updating customer feedback: {str(e)}")
        if not feedback:
            raise ValueError(f"Customer feedback with ID {feedback_id} does not exist.")
        for key, value in data.items():
            setattr(feedback, key, value)
        feedback.save()
        return feedback
    
    @staticmethod
    def create_workshop_feedback(data):
        """
        Creates a new workshop feedback entry in the database.
        """
        try:
            feedback = CustomerFeedback.objects.create(**data)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error creating workshop feedback: {str(e)}")
        return feedback
    
    @staticmethod
    def get_feedback_by_rating(rating):
        """
        Retrieves customer feedback by its rating.
        """
        try:
            feedback = CustomerFeedback.objects.filter(rating=rating)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving customer feedback by rating: {str(e)}")
        return feedback
    
    @staticmethod
    def get_feedback_by_tag(tag):
        """
        Retrieves customer feedback by its tag.
        """
        try:
            feedback = CustomerFeedback.objects.filter(tag=tag)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving customer feedback by tag: {str(e)}")
        return feedback
    
    @staticmethod
    def get_feedback_with_recommendation(recommendation):
        """
        Retrieves customer feedback with a specific recommendation.
        """
        try:
            feedback = CustomerFeedback.objects.filter(recommendation=recommendation)
        except Exception as e:
            # Log the exception or handle it as needed
            raise RuntimeError(f"Error retrieving customer feedback with recommendation: {str(e)}")
        return feedback