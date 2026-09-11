import json
import urllib.parse
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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


class GoogleSignInView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        credential = request.data.get('credential')
        client_id = settings.GOOGLE_OAUTH_CLIENT_ID
        if not credential or not client_id:
            return Response({'detail': 'Google sign-in is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            query = urllib.parse.urlencode({'id_token': credential})
            with urlopen(f'https://oauth2.googleapis.com/tokeninfo?{query}', timeout=10) as response:
                profile = json.load(response)
        except (HTTPError, URLError, TimeoutError, ValueError):
            return Response({'detail': 'Google could not verify this sign-in.'}, status=status.HTTP_401_UNAUTHORIZED)

        if profile.get('aud') != client_id or profile.get('iss') not in {'accounts.google.com', 'https://accounts.google.com'} or profile.get('email_verified') != 'true':
            return Response({'detail': 'Google account verification failed.'}, status=status.HTTP_401_UNAUTHORIZED)

        email = profile.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Google did not provide an email address.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            user = User.objects.create_user(username=email, email=email)
            user.set_unusable_password()
            user.save(update_fields=['password'])
        elif not user.is_active:
            return Response({'detail': 'This account is inactive.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = TokenObtainPairSerializer.get_token(user)
        return Response({'refresh': str(refresh), 'access': str(refresh.access_token), 'user': {'email': email}})


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
