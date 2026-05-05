from django.urls import path
from .views import SignupView, LoginView, LogoutView, MeView, TherapistListView, AssignTherapistView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('therapists/', TherapistListView.as_view(), name='therapist-list'),
    path('therapists/<uuid:therapist_id>/assign/', AssignTherapistView.as_view(), name='therapist-assign'),
]