"""
Patient Views
Mirrors: api/patient/{dashboard,profile,stent_progress}.php
"""

from datetime import date, timedelta
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from api.models import Doctor, Patient, Stent, Notification, HydrationLog
from api.utils import send_success, send_error, get_auth_user


def _get_patient(user):
    try:
        return Patient.objects.select_related('doctor__user').get(user=user)
    except Patient.DoesNotExist:
        return None


@method_decorator(csrf_exempt, name='dispatch')
class DashboardView(View):
    """GET /api/patient/dashboard/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        today = date.today()

        # Active stent
        stent = Stent.objects.filter(
            patient=patient, status='active'
        ).order_by('-insertion_date').first()

        stent_data = None
        if stent:
            days_left = (stent.expected_removal_date - today).days
            days_elapsed = (today - stent.insertion_date).days
            total_days = (stent.expected_removal_date - stent.insertion_date).days
            progress = min(100, max(0, round((days_elapsed / total_days) * 100))) if total_days > 0 else 0
            stent_data = {
                'id': stent.id,
                'stent_id': stent.stent_id,
                'insertion_date': str(stent.insertion_date),
                'expected_removal_date': str(stent.expected_removal_date),
                'status': stent.status,
                'notes': stent.notes,
                'days_left': days_left,
                'days_elapsed': days_elapsed,
                'total_days': total_days,
                'progress_percent': progress,
            }

        # Doctor info
        doctor_info = None
        if patient.doctor:
            d = patient.doctor
            doctor_info = {
                'id': d.id,
                'specialization': d.specialization,
                'full_name': d.user.full_name,
                'phone': d.user.phone,
                'email': d.user.email,
            }

        # Unread notifications
        unread_count = Notification.objects.filter(user=user, is_read=0).count()

        # Today's hydration
        try:
            hydration = HydrationLog.objects.get(patient=patient, log_date=today)
            hydration_data = {'glasses': hydration.glasses, 'daily_goal': hydration.daily_goal}
        except HydrationLog.DoesNotExist:
            hydration_data = {'glasses': 0, 'daily_goal': 8}

        return send_success('Dashboard loaded', {
            'patient_name': user.full_name,
            'patient_id': patient.patient_id,
            'active_stent': stent_data,
            'doctor': doctor_info,
            'unread_notifications': unread_count,
            'today_hydration': hydration_data,
        })


@method_decorator(csrf_exempt, name='dispatch')
class ProfileView(View):
    """GET /api/patient/profile/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        doctor_name = None
        doctor_specialization = None
        if patient.doctor:
            doctor_name = patient.doctor.user.full_name
            doctor_specialization = patient.doctor.specialization

        return send_success('Profile loaded', {
            'id': patient.id,
            'patient_id': patient.patient_id,
            'age': patient.age,
            'gender': patient.gender,
            'emergency_contact': patient.emergency_contact,
            'blood_group': patient.blood_group,
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'doctor_name': doctor_name,
            'doctor_specialization': doctor_specialization,
        })


@method_decorator(csrf_exempt, name='dispatch')
class StentProgressView(View):
    """GET /api/patient/stent_progress/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        today = date.today()
        stent = Stent.objects.filter(
            patient=patient, status='active'
        ).order_by('-insertion_date').first()

        if not stent:
            return send_success('No active stent', {'stent': None, 'timeline': []})

        days_left = (stent.expected_removal_date - today).days
        days_elapsed = (today - stent.insertion_date).days
        total_days = (stent.expected_removal_date - stent.insertion_date).days
        progress = min(100, max(0, round((days_elapsed / total_days) * 100))) if total_days > 0 else 0

        stent_data = {
            'id': stent.id,
            'stent_id': stent.stent_id,
            'insertion_date': str(stent.insertion_date),
            'expected_removal_date': str(stent.expected_removal_date),
            'status': stent.status,
            'notes': stent.notes,
            'days_left': days_left,
            'days_elapsed': days_elapsed,
            'total_days': total_days,
            'progress_percent': progress,
        }

        # Build timeline
        timeline = []
        insertion_date = stent.insertion_date
        removal_date = stent.expected_removal_date

        timeline.append({
            'event': 'Stent Inserted',
            'date': str(insertion_date),
            'status': 'completed',
            'icon': 'check',
        })

        week2 = insertion_date + timedelta(weeks=2)
        if week2 < removal_date:
            timeline.append({
                'event': 'Week 2 Check',
                'date': str(week2),
                'status': 'completed' if today >= week2 else 'pending',
                'icon': 'check' if today >= week2 else 'clock',
            })

        week4 = insertion_date + timedelta(weeks=4)
        if week4 < removal_date:
            timeline.append({
                'event': 'Week 4 Check',
                'date': str(week4),
                'status': 'completed' if today >= week4 else 'pending',
                'icon': 'check' if today >= week4 else 'clock',
            })

        timeline.append({
            'event': 'Current Stage',
            'date': str(today),
            'status': 'current',
            'icon': 'current',
        })

        timeline.append({
            'event': 'Removal Scheduled',
            'date': str(removal_date),
            'status': 'upcoming',
            'icon': 'calendar',
        })

        return send_success('Progress loaded', {
            'stent': stent_data,
            'timeline': timeline,
        })


import json

@method_decorator(csrf_exempt, name='dispatch')
class UpdateProfileView(View):
    """PUT /api/patient/profile/"""

    def put(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        full_name = data.get('full_name', '').strip()
        phone = data.get('phone', '').strip()
        profile_image = data.get('profile_image', None)

        if not full_name:
            return send_error('Name is required')

        user.full_name = full_name
        if phone:
            user.phone = phone
        if profile_image:
            user.profile_image = profile_image
        user.save()

        return send_success('Profile updated successfully', {
            'full_name': user.full_name,
            'phone': user.phone,
        })
