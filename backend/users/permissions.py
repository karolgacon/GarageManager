from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Zezwala tylko na dostęp dla użytkowników z rolą 'admin'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsOwner(permissions.BasePermission):
    """
    Zezwala tylko na dostęp dla użytkowników z rolą 'owner'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'owner'

class IsMechanic(permissions.BasePermission):
    """
    Zezwala tylko na dostęp dla użytkowników z rolą 'mechanic'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'mechanic'

class IsOwnProfile(permissions.BasePermission):
    """
    Pozwala użytkownikowi na modyfikację tylko własnego profilu.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user