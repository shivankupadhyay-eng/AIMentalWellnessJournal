from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import SignupSerializer, LoginSerializer, TherapistSerializer
from .permissions import IsUser, IsTherapist, IsAdmin
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser

class SignupView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer=LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user=serializer.validated_data['user']
        if not user.is_active :
            return Response({'error':'Account is disabled'}, status=status.HTTP_403_FORBIDDEN)
        refresh=RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'role': user.role,
            }
        },
        status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST) 

class MeView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
        })


class TherapistListView(APIView):
    """Returns all registered therapists."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        therapists = CustomUser.objects.filter(role='therapist', is_active=True)
        serializer = TherapistSerializer(therapists, many=True)
        return Response(serializer.data)


class AssignTherapistView(APIView):
    """Assigns a therapist to the logged-in user."""
    permission_classes = [IsUser]

    def post(self, request, therapist_id):
        try:
            therapist = CustomUser.objects.get(id=therapist_id, role='therapist', is_active=True)
        except CustomUser.DoesNotExist:
            return Response({'error': 'Therapist not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        user.therapist = therapist
        user.save(update_fields=['therapist'])

        return Response({
            'message': f'You are now connected with {therapist.first_name} {therapist.last_name}.',
            'therapist': TherapistSerializer(therapist).data,
        }, status=status.HTTP_200_OK)