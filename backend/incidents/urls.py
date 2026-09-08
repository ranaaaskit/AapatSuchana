from django.urls import path
from .views import IncidentListCreateView, IncidentDetailView, RegisterView, MeView, live_incidents

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('live-incidents/', live_incidents, name='live-incidents'),
    path('incidents/', IncidentListCreateView.as_view(), name='incident-list'),
    path('incidents/<int:pk>/', IncidentDetailView.as_view(), name='incident-detail'),
]
