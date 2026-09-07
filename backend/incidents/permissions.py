from rest_framework.permissions import BasePermission
from .models import EmployeeAccount


class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return EmployeeAccount.objects.filter(
            email__iexact=request.user.email,
            active=True,
        ).exists()
