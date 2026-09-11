from django.contrib.auth.models import User
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import EmployeeAccount, Incident


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password', '')
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if not user or not user.check_password(password):
            raise AuthenticationFailed('No active account found with the given credentials')

        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')
        extra_kwargs = {'password': {'write_only': True, 'min_length': 6}}

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists() or User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists. Sign in instead.')
        return email

    def create(self, validated_data):
        email = validated_data['email'].lower()
        return User.objects.create_user(username=email, email=email, password=validated_data['password'])


class EmployeeAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeAccount
        fields = ('email', 'display_name', 'active')


class IncidentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = ('id', 'title', 'type', 'severity', 'lat', 'lng', 'description', 'user', 'status', 'verified', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

    def validate_lat(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError('Latitude must be between -90 and 90.')
        return value

    def validate_lng(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError('Longitude must be between -180 and 180.')
        return value
