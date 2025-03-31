from functools import wraps
from django.http import HttpResponseForbidden

def role_required(allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if request.user.is_authenticated and request.user.role in allowed_roles:
                return view_func(request, *args, **kwargs)
            return HttpResponseForbidden("Nie masz uprawnień do tej strony.")
        return wrapped_view
    return decorator

# Przykład użycia:
# @role_required(['admin', 'owner'])
# def some_view(request):
#     # Ta funkcja będzie dostępna tylko dla adminów i właścicieli
#     pass