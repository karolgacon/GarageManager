from backend.views_collection.BaseView import BaseViewSet
from rest_framework.permissions import IsAdminUser
from drf_spectacular.utils import extend_schema, extend_schema_view
from ..services.loginHistoryService import LoginHistoryService
from ..serializers import LoginHistorySerializer
from rest_framework.response import Response

@extend_schema_view(
    list=extend_schema(
        summary="List all login history",
        description="Returns a list of all login history entries, sorted by login time.",
        responses={200: LoginHistorySerializer(many=True)}
    )
)
class LoginHistoryViewSet(BaseViewSet):
    service = LoginHistoryService
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAdminUser]  # Tylko administratorzy mogą przeglądać historię logowań

    def list(self, request, *args, **kwargs):
        """
        Zwraca historię logowań użytkowników, posortowaną od najnowszych.
        """
        records = self.service.get_all_ordered()
        serializer = self.serializer_class(records, many=True)
        return Response(serializer.data)