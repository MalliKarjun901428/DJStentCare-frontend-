"""
Utility functions for DJ Stent Care Django Backend
Mirrors the functionality from PHP config/helpers.php
"""

import base64
import random
import string
from datetime import datetime
from django.http import JsonResponse
import bcrypt


def send_response(success, message, data=None, status=200):
    """Standard JSON response - mirrors PHP sendResponse()"""
    response = {
        'success': success,
        'message': message,
    }
    if data is not None:
        response['data'] = data
    return JsonResponse(response, status=status)


def send_success(message, data=None):
    """Send success JSON response"""
    return send_response(True, message, data, 200)


def send_error(message, status=400):
    """Send error JSON response"""
    return send_response(False, message, None, status)


def get_auth_user(request):
    """
    Extract authenticated user from Authorization header.
    Token is base64(user_id) - matches PHP implementation exactly.
    Returns User ORM object on success, or None on failure.
    All views check: if not user: return send_error(...)
    """
    from api.models import User

    auth_header = request.headers.get('Authorization', '')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header[7:]  # Remove 'Bearer '

    try:
        user_id = int(base64.b64decode(token).decode('utf-8'))
    except Exception:
        return None

    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


def generate_token(user_id):
    """Generate auth token - base64(user_id) same as PHP"""
    return base64.b64encode(str(user_id).encode('utf-8')).decode('utf-8')


def generate_otp(length=6):
    """Generate numeric OTP - mirrors PHP generateOTP()"""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


def generate_id(prefix, length=4):
    """Generate unique ID like PT-2026-1234 - mirrors PHP generateId()"""
    year = datetime.now().year
    random_part = str(random.randint(1, 10**length - 1)).zfill(length)
    return f"{prefix}-{year}-{random_part}"


def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password, hashed):
    """Verify password against bcrypt hash - compatible with PHP password_hash"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False
