"""
Admin Views
Mirrors: api/admin/{dashboard,users,hospitals,doctor_approvals}.php
"""

import json
import math
from datetime import datetime, timedelta
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from api.models import User, Doctor, Patient, Hospital, Stent, Notification
from api.utils import send_success, send_error, get_auth_user


@method_decorator(csrf_exempt, name='dispatch')
class AdminDashboardView(View):
    """GET /api/admin/dashboard/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'admin':
            return send_error('Access denied', 403)

        total_doctors = User.objects.filter(role='doctor').count()
        total_patients = User.objects.filter(role='patient').count()
        active_stents = Stent.objects.filter(status='active').count()
        total_hospitals = Hospital.objects.filter(is_active=1).count()
        pending_approvals = User.objects.filter(role='doctor', is_approved=0, is_verified=1).count()

        # Recent activity (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_activity = []

        for u in User.objects.filter(role='doctor', created_at__gte=week_ago).order_by('-created_at')[:5]:
            recent_activity.append({
                'activity': 'New doctor registered',
                'detail': u.full_name,
                'time': str(u.created_at),
            })

        for s in Stent.objects.select_related('patient__user').filter(
            created_at__gte=week_ago
        ).order_by('-created_at')[:5]:
            recent_activity.append({
                'activity': 'New stent insertion',
                'detail': f'{s.stent_id} for {s.patient.user.full_name}',
                'time': str(s.created_at),
            })

        recent_activity.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = recent_activity[:10]

        return send_success('Dashboard loaded', {
            'stats': {
                'total_doctors': total_doctors,
                'total_patients': total_patients,
                'active_stents': active_stents,
                'total_hospitals': total_hospitals,
                'pending_approvals': pending_approvals,
            },
            'recent_activity': recent_activity,
        })


@method_decorator(csrf_exempt, name='dispatch')
class UsersView(View):
    """GET/POST /api/admin/users/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'admin':
            return send_error('Access denied', 403)

        role = request.GET.get('role', '')
        search = request.GET.get('search', '').strip()
        page = int(request.GET.get('page', 1))
        limit = 20
        offset = (page - 1) * limit

        qs = User.objects.exclude(role='admin')

        if role in ('doctor', 'patient'):
            qs = qs.filter(role=role)

        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) | Q(email__icontains=search)
            )

        total = qs.count()
        users_page = qs.order_by('-created_at')[offset:offset + limit]

        users_data = []
        for u in users_page:
            users_data.append({
                'id': u.id,
                'role': u.role,
                'full_name': u.full_name,
                'email': u.email,
                'phone': u.phone,
                'is_verified': u.is_verified,
                'is_approved': u.is_approved,
                'created_at': str(u.created_at),
            })

        return send_success('Users loaded', {
            'users': users_data,
            'total': total,
            'page': page,
            'pages': math.ceil(total / limit),
        })

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'admin':
            return send_error('Access denied', 403)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        if not data.get('user_id') or not data.get('action'):
            return send_error('Missing required fields: user_id, action')

        target_id = int(data['user_id'])
        action = data['action'].lower()

        if target_id == user.id:
            return send_error('Cannot modify your own account')

        try:
            target = User.objects.exclude(role='admin').get(id=target_id)
        except User.DoesNotExist:
            return send_error('User not found', 404)

        if action == 'delete':
            target.delete()
            return send_success('User deleted')
        elif action == 'suspend':
            target.is_approved = 0
            target.save()
            return send_success('User suspended')
        elif action == 'activate':
            target.is_approved = 1
            target.save()
            return send_success('User activated')
        else:
            return send_error('Invalid action')


@method_decorator(csrf_exempt, name='dispatch')
class HospitalsView(View):
    """GET/POST /api/admin/hospitals/"""

    def get(self, request):
        # No auth required to view hospitals
        hospitals = []
        for h in Hospital.objects.filter(is_active=1).order_by('name'):
            doctor_count = Doctor.objects.filter(hospital=h).count()
            hospitals.append({
                'id': h.id,
                'name': h.name,
                'address': h.address,
                'phone': h.phone,
                'email': h.email,
                'is_active': h.is_active,
                'doctor_count': doctor_count,
            })

        return send_success('Hospitals loaded', {'hospitals': hospitals})

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'admin':
            return send_error('Access denied', 403)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        action = data.get('action', 'add')

        if action == 'add':
            if not data.get('name'):
                return send_error('Missing required field: name')

            h = Hospital(
                name=data['name'].strip(),
                address=data.get('address', '').strip() or None,
                phone=data.get('phone', '').strip() or None,
                email=data.get('email', '').strip() or None,
            )
            h.save()
            return send_success('Hospital added', {'id': h.id})

        elif action == 'update':
            if not data.get('id') or not data.get('name'):
                return send_error('Missing required fields: id, name')

            try:
                h = Hospital.objects.get(id=int(data['id']))
            except Hospital.DoesNotExist:
                return send_error('Hospital not found', 404)

            h.name = data['name'].strip()
            h.address = data.get('address', '').strip() or None
            h.phone = data.get('phone', '').strip() or None
            h.email = data.get('email', '').strip() or None
            h.save()
            return send_success('Hospital updated')

        elif action == 'delete':
            if not data.get('id'):
                return send_error('Missing required field: id')

            Hospital.objects.filter(id=int(data['id'])).update(is_active=0)
            return send_success('Hospital removed')

        return send_error('Invalid action')


@method_decorator(csrf_exempt, name='dispatch')
class DoctorApprovalsView(View):
    """GET/POST /api/admin/doctor_approvals/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'admin':
            return send_error('Access denied', 403)

        doctors = []
        for u in User.objects.filter(
            role='doctor', is_approved=0, is_verified=1
        ).order_by('-created_at'):
            try:
                doc = Doctor.objects.select_related('hospital').get(user=u)
                hospital_name = doc.hospital.name if doc.hospital else None
                specialization = doc.specialization
            except Doctor.DoesNotExist:
                hospital_name = None
                specialization = None

            doctors.append({
                'id': u.id,
                'full_name': u.full_name,
                'email': u.email,
                'phone': u.phone,
                'created_at': str(u.created_at),
                'specialization': specialization,
                'hospital_name': hospital_name,
            })

        return send_success('Pending approvals loaded', {
            'doctors': doctors,
            'count': len(doctors),
        })

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'admin':
            return send_error('Access denied', 403)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        if not data.get('doctor_id') or not data.get('action'):
            return send_error('Missing required fields: doctor_id, action')

        doctor_id = int(data['doctor_id'])
        action = data['action'].lower()

        if action not in ('approve', 'reject'):
            return send_error("Invalid action. Use 'approve' or 'reject'")

        try:
            target = User.objects.get(id=doctor_id, role='doctor')
        except User.DoesNotExist:
            return send_error('Doctor not found', 404)

        if action == 'approve':
            target.is_approved = 1
            target.save()

            Notification(
                user=target,
                title='Account Approved',
                message='Your doctor account has been approved. You can now login and start managing patients.',
                type='info',
            ).save()

            return send_success('Doctor approved successfully')
        else:
            # Reject - delete account only if not yet approved
            if target.is_approved == 0:
                target.delete()
            return send_success('Doctor rejected and removed')


@method_decorator(csrf_exempt, name='dispatch')
class UpdateProfileView(View):
    """GET/PUT /api/admin/update_profile/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'admin':
            return send_error('Access denied', 403)

        return send_success('Admin profile loaded', {
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'profile_image': user.profile_image,
        })

    def put(self, request):
        user = get_auth_user(request)
        if not user or user.role != 'admin':
            return send_error('Unauthorized', 401)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        full_name = data.get('full_name')
        phone = data.get('phone')
        profile_image = data.get('profile_image')

        if full_name:
            user.full_name = full_name
        if phone:
            user.phone = phone
        if profile_image:
            user.profile_image = profile_image

        user.save()
        return send_success('Profile updated successfully')
