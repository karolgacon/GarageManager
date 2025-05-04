from backend.views_collection.BaseView import BaseViewSet
from ..services.stockEntryService import StockEntryService
from ..serializers import StockEntrySerializer
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiExample

@extend_schema_view(
    list=extend_schema(
        summary="List all stock entries",
        description="Returns a list of all stock entries in the inventory.",
        examples=[
            OpenApiExample(
                "Example Response",
                value=[
                    {
                        "id": 1,
                        "part": 101,
                        "change_type": "purchase",
                        "quantity_change": 50,
                        "timestamp": "2025-05-04T10:00:00Z",
                        "user": 1,
                        "notes": "Initial stock purchase"
                    },
                    {
                        "id": 2,
                        "part": 102,
                        "change_type": "sale",
                        "quantity_change": -10,
                        "timestamp": "2025-05-05T14:30:00Z",
                        "user": 2,
                        "notes": "Sold 10 units"
                    }
                ],
            )
        ],
    ),
    retrieve=extend_schema(
        summary="Get stock entry details",
        description="Returns detailed information about a specific stock entry.",
        examples=[
            OpenApiExample(
                "Example Response",
                value={
                    "id": 1,
                    "part": 101,
                    "change_type": "purchase",
                    "quantity_change": 50,
                    "timestamp": "2025-05-04T10:00:00Z",
                    "user": 1,
                    "notes": "Initial stock purchase"
                },
            )
        ],
    ),
    create=extend_schema(
        summary="Create a stock entry",
        description="Creates a new stock entry in the inventory.",
        examples=[
            OpenApiExample(
                "Example Request",
                value={
                    "part": 101,
                    "change_type": "purchase",
                    "quantity_change": 50,
                    "notes": "Initial stock purchase"
                },
            ),
            OpenApiExample(
                "Example Response",
                value={
                    "id": 1,
                    "part": 101,
                    "change_type": "purchase",
                    "quantity_change": 50,
                    "timestamp": "2025-05-04T10:00:00Z",
                    "user": 1,
                    "notes": "Initial stock purchase"
                },
            ),
        ],
    ),
    update=extend_schema(
        summary="Update a stock entry",
        description="Updates an existing stock entry in the inventory.",
        examples=[
            OpenApiExample(
                "Example Request",
                value={
                    "part": 101,
                    "change_type": "adjustment",
                    "quantity_change": 60,
                    "notes": "Adjusted stock after audit"
                },
            ),
            OpenApiExample(
                "Example Response",
                value={
                    "id": 1,
                    "part": 101,
                    "change_type": "adjustment",
                    "quantity_change": 60,
                    "timestamp": "2025-05-04T10:00:00Z",
                    "user": 1,
                    "notes": "Adjusted stock after audit"
                },
            ),
        ],
    ),
    partial_update=extend_schema(
        summary="Partially update a stock entry",
        description="Partially updates fields of an existing stock entry in the inventory.",
        examples=[
            OpenApiExample(
                "Example Request",
                value={
                    "quantity_change": 70,
                    "notes": "Corrected stock quantity"
                },
            ),
            OpenApiExample(
                "Example Response",
                value={
                    "id": 1,
                    "part": 101,
                    "change_type": "purchase",
                    "quantity_change": 70,
                    "timestamp": "2025-05-04T10:00:00Z",
                    "user": 1,
                    "notes": "Corrected stock quantity"
                },
            ),
        ],
    ),
    destroy=extend_schema(
        summary="Delete a stock entry",
        description="Deletes a stock entry from the inventory.",
        examples=[
            OpenApiExample(
                "Example Response",
                value={"detail": "Stock entry deleted successfully."},
            )
        ],
    ),
)
class StockEntryViewSet(BaseViewSet):
    service = StockEntryService
    serializer_class = StockEntrySerializer