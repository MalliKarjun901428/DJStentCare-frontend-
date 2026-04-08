"""
Authentication Views
Mirrors: api/auth/{login,register,verify_otp,forgot_password,reset_password}.php
"""

import json
from datetime import datetime, timedelta
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings as django_settings
from django.core.mail import send_mail

from api.models import User, Doctor, Patient, Hospital
from api.utils import (
    send_success, send_error, generate_otp, generate_token,
    generate_id, hash_password, verify_password, get_auth_user
)


def send_otp_email(to_email, otp, subject='Your OTP Code'):
    """
    Send OTP via email. Skips silently if EMAIL_DEBUG_MODE is True.
    Returns True if sent, False otherwise.
    """
    if getattr(django_settings, 'EMAIL_DEBUG_MODE', True):
        return False  # skip sending, use debug_otp in response
    try:
        send_mail(
            subject=subject,
            message=f'Your OTP code is: {otp}\n\nThis code expires in 10 minutes.',
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f'Email send error: {e}')
        return False



@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(View):
    """POST /api/auth/register/"""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        required = ['role', 'email', 'password', 'full_name', 'phone']
        for field in required:
            if not data.get(field, '').strip() if isinstance(data.get(field), str) else not data.get(field):
                return send_error(f'Missing required field: {field}')

        role = data['role'].lower().strip()
        email = data['email'].strip().lower()
        password = data['password']
        full_name = data['full_name'].strip()
        phone = data['phone'].strip()

        if role not in ['doctor', 'patient', 'admin']:
            return send_error("Invalid role. Must be 'doctor', 'patient', or 'admin'")

        import re
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return send_error('Invalid email format')

        if len(password) < 6:
            return send_error('Password must be at least 6 characters')

        if User.objects.filter(email=email).exists():
            return send_error('Email already registered')

        hashed_password = hash_password(password)
        otp = generate_otp()
        otp_expiry = datetime.now() + timedelta(minutes=10)
        is_approved = 1 if role in ['patient', 'admin'] else 0

        user = User(
            role=role,
            email=email,
            password=hashed_password,
            full_name=full_name,
            profile_image=data.get('profile_image', '').strip(),
            is_approved=is_approved,
            is_verified=0,
            otp_code=otp,
            otp_expiry=otp_expiry,
        )
        user.save()

        if role == 'doctor':
            specialization = data.get('specialization', '').strip()
            hospital_id = data.get('hospital_id')
            doctor = Doctor(user=user, specialization=specialization)
            if hospital_id:
                try:
                    doctor.hospital = Hospital.objects.get(id=int(hospital_id))
                except Hospital.DoesNotExist:
                    pass
            doctor.save()
        else:
            patient_id = generate_id('PT')
            age = data.get('age')
            gender = data.get('gender', '').strip()
            Patient(
                user=user,
                patient_id=patient_id,
                age=int(age) if age else None,
                gender=gender if gender else None,
            ).save()

        email_sent = send_otp_email(
            to_email=email,
            otp=otp,
            subject='DJ Stent Care - Verify Your Account'
        )

        response_data = {
            'user_id': user.id,
            'email': email,
            'role': role,
            'email_sent': email_sent,
            'debug_otp': otp,  # Always returned; app shows it when email not sent
            'note': 'Email sent!' if email_sent else 'Email not configured. Use debug_otp to verify.',
            'message': (
                'Registration successful. Please check your email for OTP and wait for admin approval.'
                if role == 'doctor'
                else 'Registration successful. Please verify with the OTP.'
            )
        }

        return send_success('Registration successful. OTP sent.', response_data)



@method_decorator(csrf_exempt, name='dispatch')
class LoginView(View):
    """POST /api/auth/login/"""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        requested_role = data.get('role', '').strip().lower()

        if not email or not password:
            return send_error('Missing required fields: email, password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return send_error('Invalid email or password', 401)

        # ⚡ NEW: Role Consistency Check
        if requested_role and user.role != requested_role:
            return send_error(f'This account is registered as {user.role}, not {requested_role}.', 401)

        if not verify_password(password, user.password):
            return send_error('Invalid email or password', 401)

        if not user.is_verified:
            otp = generate_otp()
            otp_expiry = datetime.now() + timedelta(minutes=10)
            user.otp_code = otp
            user.otp_expiry = otp_expiry
            user.save()
            send_otp_email(user.email, otp, 'DJ Stent Care - Verify Your Account')
            from django.http import JsonResponse
            return JsonResponse({
                'success': False,
                'message': 'Please verify your account first.',
                'debug_otp': otp,
                'email': user.email,
            }, status=403)

        if user.role == 'doctor' and not user.is_approved:
            return send_error('Your account is pending admin approval. You will be notified once approved.', 403)

        token = generate_token(user.id)

        role_data = None
        if user.role == 'doctor':
            try:
                doctor = Doctor.objects.select_related('hospital').get(user=user)
                role_data = {
                    'doctor_id': doctor.id,
                    'specialization': doctor.specialization,
                    'total_patients': doctor.total_patients,
                    'active_stents': doctor.active_stents,
                    'hospital_name': doctor.hospital.name if doctor.hospital else None,
                }
            except Doctor.DoesNotExist:
                pass
        elif user.role == 'patient':
            try:
                patient = Patient.objects.select_related('doctor__user').get(user=user)
                role_data = {
                    'patient_profile_id': patient.id,
                    'patient_id': patient.patient_id,
                    'age': patient.age,
                    'gender': patient.gender,
                    'doctor_id': patient.doctor.id if patient.doctor else None,
                    'doctor_name': patient.doctor.user.full_name if patient.doctor else None,
                }
            except Patient.DoesNotExist:
                pass

        return send_success('Login successful', {
            'token': token,
            'user': {
                'id': user.id,
                'role': user.role,
                'email': user.email,
                'full_name': user.full_name,
                'phone': user.phone,
                'profile_image': user.profile_image,
            },
            'profile': role_data,
        })


@method_decorator(csrf_exempt, name='dispatch')
class VerifyOTPView(View):
    """POST /api/auth/verify_otp/"""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()

        if not email or not otp:
            return send_error('Missing required fields: email, otp')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return send_error('User not found')

        if user.otp_code != otp:
            return send_error('Invalid OTP')

        if user.otp_expiry and datetime.now() > user.otp_expiry:
            return send_error('OTP has expired. Please request a new one.')

        user.is_verified = 1
        user.otp_code = None
        user.otp_expiry = None
        user.save()

        token = generate_token(user.id)
        message = 'Account verified successfully'
        response_data = {
            'verified': True,
            'role': user.role,
            'is_approved': bool(user.is_approved),
        }

        if user.role == 'doctor' and not user.is_approved:
            message = 'Account verified. Please wait for admin approval to login.'
            token = None

        if token:
            response_data['token'] = token

        return send_success(message, response_data)


@method_decorator(csrf_exempt, name='dispatch')
class ForgotPasswordView(View):
    """POST /api/auth/forgot_password/"""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        email = data.get('email', '').strip().lower()
        if not email:
            return send_error('Missing required field: email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return send_success('If this email exists, an OTP has been sent')

        otp = generate_otp()
        otp_expiry = datetime.now() + timedelta(minutes=10)
        user.otp_code = otp
        user.otp_expiry = otp_expiry
        user.save()

        return send_success('OTP sent to your email', {
            'email_sent': False,
            'debug_otp': otp,
            'note': 'Email sending not configured. Use debug_otp for testing.',
            'message': 'If this email is registered, you will receive a password reset code.'
        })


@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordView(View):
    """POST /api/auth/reset_password/"""

    def post(self, request):
        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        new_password = data.get('new_password', '')

        if not email or not otp or not new_password:
            return send_error('Missing required fields: email, otp, new_password')

        if len(new_password) < 6:
            return send_error('Password must be at least 6 characters')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return send_error('Invalid request')

        if user.otp_code != otp:
            return send_error('Invalid OTP')

        if user.otp_expiry and datetime.now() > user.otp_expiry:
            return send_error('OTP has expired')

        user.password = hash_password(new_password)
        user.otp_code = None
        user.otp_expiry = None
        user.save()

        return send_success('Password reset successfully. You can now login with your new password.')


@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(View):
    """POST /api/auth/change_password/"""

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')

        if not current_password or not new_password:
            return send_error('Missing required fields')

        if len(new_password) < 6:
            return send_error('New password must be at least 6 characters')

        if not verify_password(current_password, user.password):
            return send_error('Current password is incorrect')

        user.password = hash_password(new_password)
        user.save()

        return send_success('Password changed successfully')
