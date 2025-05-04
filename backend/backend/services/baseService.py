from django.http import Http404
from django.core.exceptions import ValidationError

class BaseService:
    repository = None  # This should be overridden in child classes

    @classmethod
    def get_all(cls):
        """
        Retrieves all records from the database.
        """
        try:
            return cls.repository.get_all()
        except Exception as e:
            raise RuntimeError(f"Error retrieving {cls.repository.model.__name__} records: {str(e)}")

    @classmethod
    def get_by_id(cls, record_id):
        """
        Retrieves a record by its ID.
        """
        try:
            return cls.repository.get_by_id(record_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error retrieving {cls.repository.model.__name__}: {str(e)}")

    @classmethod
    def create(cls, data):
        """
        Creates a new record in the database.
        """
        try:
            return cls.repository.create(data)
        except ValidationError as e:
            raise ValidationError({"error": str(e)})
        except Exception as e:
            raise RuntimeError(f"Error creating {cls.repository.model.__name__}: {str(e)}")

    @classmethod
    def update(cls, record_id, data):
        """
        Updates an existing record.
        """
        try:
            return cls.repository.update(record_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error updating {cls.repository.model.__name__}: {str(e)}")

    @classmethod
    def partially_update(cls, record_id, data):
        """
        Partially updates an existing record.
        """
        try:
            return cls.repository.partially_update(record_id, data)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error partially updating {cls.repository.model.__name__}: {str(e)}")

    @classmethod
    def delete(cls, record_id):
        """
        Deletes a record by its ID.
        """
        try:
            return cls.repository.delete(record_id)
        except ValueError as e:
            raise Http404(str(e))
        except Exception as e:
            raise RuntimeError(f"Error deleting {cls.repository.model.__name__}: {str(e)}")