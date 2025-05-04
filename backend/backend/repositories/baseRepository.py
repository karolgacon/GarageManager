class BaseRepository:
    model = None  # This should be overridden in child classes

    @classmethod
    def get_all(cls):
        """
        Retrieves all records from the database.
        """
        try:
            return cls.model.objects.all()
        except Exception as e:
            raise RuntimeError(f"Error retrieving {cls.model.__name__} records: {str(e)}")

    @classmethod
    def get_by_id(cls, record_id):
        """
        Retrieves a record by its ID.
        """
        try:
            return cls.model.objects.get(id=record_id)
        except cls.model.DoesNotExist:
            raise ValueError(f"{cls.model.__name__} with ID {record_id} does not exist.")
        except Exception as e:
            raise RuntimeError(f"Error retrieving {cls.model.__name__}: {str(e)}")

    @classmethod
    def create(cls, data):
        """
        Creates a new record in the database.
        """
        try:
            return cls.model.objects.create(**data)
        except Exception as e:
            raise RuntimeError(f"Error creating {cls.model.__name__}: {str(e)}")

    @classmethod
    def update(cls, record_id, data):
        """
        Updates an existing record.
        """
        try:
            record = cls.get_by_id(record_id)
            for key, value in data.items():
                setattr(record, key, value)
            record.save()
            return record
        except Exception as e:
            raise RuntimeError(f"Error updating {cls.model.__name__}: {str(e)}")

    @classmethod
    def partially_update(cls, record_id, data):
        """
        Partially updates an existing record.
        """
        return cls.update(record_id, data)

    @classmethod
    def delete(cls, record_id):
        """
        Deletes a record by its ID.
        """
        try:
            record = cls.get_by_id(record_id)
            record.delete()
        except Exception as e:
            raise RuntimeError(f"Error deleting {cls.model.__name__}: {str(e)}")