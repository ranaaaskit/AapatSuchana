from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import EmployeeAccount, Incident
from .permissions import IsEmployee
from .serializers import EmployeeAccountSerializer, IncidentSerializer, RegistrationSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistrationSerializer


class MeView(APIView):
    def get(self, request):
        employee = EmployeeAccount.objects.filter(email__iexact=request.user.email, active=True).first()
        return Response({
            'email': request.user.email,
            'is_employee': employee is not None,
            'employee': EmployeeAccountSerializer(employee).data if employee else None,
        })


class IncidentListCreateView(generics.ListCreateAPIView):
    serializer_class = IncidentSerializer

    def get_queryset(self):
        queryset = Incident.objects.all()
        if not IsEmployee().has_permission(self.request, self):
            queryset = queryset.filter(status=Incident.Status.APPROVED)
        return queryset[:200]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status=Incident.Status.PENDING)


class IncidentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = IncidentSerializer

    def get_queryset(self):
        if IsEmployee().has_permission(self.request, self):
            return Incident.objects.all()
        return Incident.objects.filter(status=Incident.Status.APPROVED)

    def update(self, request, *args, **kwargs):
        if not IsEmployee().has_permission(request, self):
            return Response({'detail': 'Employee access is required.'}, status=403)
        return super().update(request, *args, **kwargs)
