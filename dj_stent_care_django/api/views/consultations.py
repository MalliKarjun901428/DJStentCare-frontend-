"""
Consultation Views
Mirrors: api/consultations/index.php
"""

import json
from datetime import date
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from api.models import Doctor, Patient, Consultation
from api.utils import send_success, send_error, get_auth_user


@method_decorator(csrf_exempt, name='dispatch')
class ConsultationsView(View):
    """GET/POST /api/consultations/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        status_filter = request.GET.get('status', '')
        today = date.today()

        if user.role == 'patient':
            try:
                patient = Patient.objects.get(user=user)
            except Patient.DoesNotExist:
                return send_error('Patient profile not found', 404)

            qs = Consultation.objects.filter(
                patient=patient
            ).select_related('doctor__user')

            if status_filter:
                qs = qs.filter(status=status_filter)

            consultations = []
            for c in qs.order_by('-scheduled_date', '-scheduled_time'):
                consultations.append({
                    'id': c.id,
                    'scheduled_date': str(c.scheduled_date),
                    'scheduled_time': str(c.scheduled_time),
                    'consultation_type': c.consultation_type,
                    'status': c.status,
                    'meeting_link': c.meeting_link,
                    'notes': c.notes,
                    'doctor_name': c.doctor.user.full_name,
                    'specialization': c.doctor.specialization,
                })

        elif user.role == 'doctor':
            try:
                doctor = Doctor.objects.get(user=user)
            except Doctor.DoesNotExist:
                return send_error('Doctor profile not found', 404)

            qs = Consultation.objects.filter(
                doctor=doctor
            ).select_related('patient__user')

            if status_filter:
                qs = qs.filter(status=status_filter)

            consultations = []
            for c in qs.order_by('-scheduled_date', '-scheduled_time'):
                consultations.append({
                    'id': c.id,
                    'scheduled_date': str(c.scheduled_date),
                    'scheduled_time': str(c.scheduled_time),
                    'consultation_type': c.consultation_type,
                    'status': c.status,
                    'meeting_link': c.meeting_link,
                    'notes': c.notes,
                    'patient_name': c.patient.user.full_name,
                    'patient_id': c.patient.patient_id,
                })
        else:
            return send_error('Access denied', 403)

        upcoming = [c for c in consultations
                    if c['scheduled_date'] >= str(today) and c['status'] == 'scheduled']
        past = [c for c in consultations
                if not (c['scheduled_date'] >= str(today) and c['status'] == 'scheduled')]

        return send_success('Consultations loaded', {
            'upcoming': upcoming,
            'past': past,
        })

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        action = data.get('action', 'schedule')

        if action == 'schedule':
            for field in ['patient_id', 'doctor_id', 'scheduled_date', 'scheduled_time', 'consultation_type']:
                if not data.get(field):
                    return send_error(f'Missing required field: {field}')

            c = Consultation(
                patient_id=int(data['patient_id']),
                doctor_id=int(data['doctor_id']),
                scheduled_date=data['scheduled_date'],
                scheduled_time=data['scheduled_time'],
                consultation_type=data['consultation_type'].strip(),
            )
            c.save()
            return send_success('Consultation scheduled', {'id': c.id})

        elif action == 'cancel':
            if not data.get('id'):
                return send_error('Missing required field: id')
            Consultation.objects.filter(id=int(data['id'])).update(status='cancelled')
            return send_success('Consultation cancelled')

        elif action == 'complete':
            if not data.get('id'):
                return send_error('Missing required field: id')
            notes = data.get('notes', '').strip() or None
            Consultation.objects.filter(id=int(data['id'])).update(
                status='completed', notes=notes
            )
            return send_success('Consultation completed')

        return send_error('Invalid action')
