import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from rest_framework import generics, permissions
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import EmployeeAccount, Incident
from .permissions import IsEmployee
from .serializers import EmployeeAccountSerializer, IncidentSerializer, RegistrationSerializer


def live_incidents(request):
    if request.method != 'GET':
        return JsonResponse({'detail': 'Only GET is supported.'}, status=405)

    upstream_url = 'https://bipadportal.gov.np/api/v1/incident/?limit=1000&offset=0'
    try:
        upstream_request = Request(upstream_url, headers={'Accept': 'application/json', 'User-Agent': 'AapatSuchana/1.0'})
        with urlopen(upstream_request, timeout=15) as response:
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError) as error:
        return JsonResponse({'detail': f'BIPAD incident service unavailable: {error}'}, status=502)

    return JsonResponse(payload)


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
