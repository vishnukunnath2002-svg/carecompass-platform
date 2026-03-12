"""
apps/users — Auth views (JWT login, register, refresh, me, logout)
Replaces all Supabase Auth operations.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .serializers import RegisterSerializer, LoginSerializer, UserMeSerializer
from .models import CustomUser


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Creates a new user account. Returns JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            user_data = UserMeSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates user. Returns JWT token pair + user profile.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            # Embed user_id and roles in the token
            refresh['user_id'] = str(user.id)
            roles = list(user.roles.values_list('role', flat=True))
            refresh['roles'] = roles
            refresh.access_token['user_id'] = str(user.id)
            refresh.access_token['roles'] = roles

            user_data = UserMeSerializer(user).data
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': user_data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({'detail': 'Logged out successfully.'})
        except TokenError:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """
    GET /api/auth/me/
    Returns current user's profile, roles, and tenant information.
    Used by the frontend to restore session state.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_data = UserMeSerializer(request.user).data
        return Response(user_data)

    def patch(self, request):
        """Update user profile fields (full_name, phone)."""
        user = request.user
        full_name = request.data.get('full_name')
        phone = request.data.get('phone')
        if full_name:
            user.full_name = full_name
        if phone:
            user.phone = phone
        user.save()

        # Also update Profile if avatar/DOB/gender provided
        profile = getattr(user, 'profile', None)
        if profile:
            for field in ['avatar_url', 'date_of_birth', 'gender']:
                val = request.data.get(field)
                if val is not None:
                    setattr(profile, field, val)
            profile.save()

        return Response(UserMeSerializer(user).data)
