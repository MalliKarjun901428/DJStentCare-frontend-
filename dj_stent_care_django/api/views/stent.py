"""
Stent Views
Mirrors: api/stent/{add,update,details}.php
"""

import json
from datetime import date, datetime
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from api.models import Doctor, Patient, Stent, Notification
from api.utils import send_success, send_error, get_auth_user, generate_id


def _get_doctor(user):
    try:
        return Doctor.objects.get(user=user)
    except Doctor.DoesNotExist:
        return None


@method_decorator(csrf_exempt, name='dispatch')
class AddStentView(View):
    """POST /api/stent/add/"""

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
            return send_error('Access denied', 403)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        for field in ['patient_id', 'insertion_date', 'expected_removal_date']:
            if not data.get(field):
                return send_error(f'Missing required field: {field}')

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        patient_id = int(data['patient_id'])
        stent_id = data.get('stent_id', '').strip() or generate_id('ST')
        insertion_date = data['insertion_date']
        expected_removal_date = data['expected_removal_date']
        notes = data.get('notes', '').strip() or None

        # Verify patient belongs to doctor
        try:
            patient = Patient.objects.get(id=patient_id, doctor=doctor)
        except Patient.DoesNotExist:
            return send_error('Patient not found or not assigned to you')

        # Check stent_id unique
        if Stent.objects.filter(stent_id=stent_id).exists():
            return send_error('Stent ID already exists')

        # Validate dates
        try:
            ins_date = datetime.strptime(insertion_date, '%Y-%m-%d').date()
            exp_date = datetime.strptime(expected_removal_date, '%Y-%m-%d').date()
        except ValueError:
            return send_error('Invalid date format. Use YYYY-MM-DD')

        if exp_date <= ins_date:
            return send_error('Expected removal date must be after insertion date')

        stent = Stent(
            stent_id=stent_id,
            patient=patient,
            doctor=doctor,
            insertion_date=ins_date,
            expected_removal_date=exp_date,
            notes=notes,
            status='active',
        )
        stent.save()

        # Increment doctor active_stents
        Doctor.objects.filter(id=doctor.id).update(active_stents=doctor.active_stents + 1)

        # Notify patient
        Notification(
            user=patient.user,
            title='DJ Stent Inserted',
            message=f'Your DJ stent ({stent_id}) has been inserted. Expected removal: {expected_removal_date}',
            type='info',
        ).save()

        return send_success('DJ Stent added successfully', {
            'id': stent.id,
            'stent_id': stent_id,
            'insertion_date': insertion_date,
            'expected_removal_date': expected_removal_date,
            'status': 'active',
        })


@method_decorator(csrf_exempt, name='dispatch')
class UpdateStentView(View):
    """POST /api/stent/update/"""

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
            return send_error('Access denied', 403)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        if not data.get('id'):
            return send_error('Missing required field: id')

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        try:
            stent = Stent.objects.select_related('patient').get(id=int(data['id']), doctor=doctor)
        except Stent.DoesNotExist:
            return send_error('Stent not found or access denied', 404)

        updated = False

        if 'expected_removal_date' in data:
            stent.expected_removal_date = data['expected_removal_date']
            updated = True

        if 'notes' in data:
            stent.notes = data['notes']
            updated = True

        if data.get('status') == 'removed':
            stent.status = 'removed'
            stent.actual_removal_date = date.today()
            updated = True

            # Decrease doctor active stent count
            new_count = max(0, doctor.active_stents - 1)
            Doctor.objects.filter(id=doctor.id).update(active_stents=new_count)

            # Notify patient
            Notification(
                user=stent.patient.user,
                title='DJ Stent Removed',
                message=f'Your DJ stent ({stent.stent_id}) has been marked as removed.',
                type='info',
            ).save()

        if not updated:
            return send_error('No fields to update')

        stent.save()
        return send_success('Stent updated successfully')


@method_decorator(csrf_exempt, name='dispatch')
class StentDetailsView(View):
    """GET /api/stent/details/?id="""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)

        stent_id = request.GET.get('id')
        if not stent_id:
            return send_error('Stent ID required')

        try:
            stent = Stent.objects.select_related(
                'patient__user', 'doctor__user'
            ).get(id=int(stent_id))
        except Stent.DoesNotExist:
            return send_error('Stent not found', 404)

        today = date.today()
        days_left = (stent.expected_removal_date - today).days
        days_elapsed = (today - stent.insertion_date).days
        total_days = (stent.expected_removal_date - stent.insertion_date).days

        result = {
            'id': stent.id,
            'stent_id': stent.stent_id,
            'insertion_date': str(stent.insertion_date),
            'expected_removal_date': str(stent.expected_removal_date),
            'actual_removal_date': str(stent.actual_removal_date) if stent.actual_removal_date else None,
            'status': stent.status,
            'notes': stent.notes,
            'patient_code': stent.patient.patient_id,
            'patient_name': stent.patient.user.full_name,
            'doctor_name': stent.doctor.user.full_name,
            'days_left': days_left,
            'days_elapsed': days_elapsed,
            'total_days': total_days,
        }

        if stent.status == 'active' and total_days > 0:
            result['progress_percent'] = min(100, max(0, round((days_elapsed / total_days) * 100)))

        return send_success('Stent details retrieved', result)
