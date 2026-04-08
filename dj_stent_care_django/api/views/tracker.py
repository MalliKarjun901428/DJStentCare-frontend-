"""
Tracker Views
Mirrors: api/tracker/{symptoms,medications,hydration}.php
"""

import json
from datetime import date, timedelta, datetime
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from api.models import Patient, SymptomLog, Medication, MedicationLog, HydrationLog
from api.utils import send_success, send_error, get_auth_user


def _get_patient(user):
    try:
        return Patient.objects.get(user=user)
    except Patient.DoesNotExist:
        return None


@method_decorator(csrf_exempt, name='dispatch')
class SymptomsView(View):
    """GET/POST /api/tracker/symptoms/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        limit = int(request.GET.get('limit', 30))
        logs = []
        for log in SymptomLog.objects.filter(patient=patient).order_by('-log_date')[:limit]:
            logs.append({
                'id': log.id,
                'log_date': str(log.log_date),
                'pain_level': log.pain_level,
                'water_intake': log.water_intake,
                'blood_in_urine': log.blood_in_urine,
                'frequent_urination': log.frequent_urination,
                'additional_notes': log.additional_notes,
                'created_at': str(log.created_at),
            })

        return send_success('Symptom logs retrieved', {'logs': logs})

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        log_date_str = data.get('log_date', str(date.today()))
        try:
            log_date = datetime.strptime(log_date_str, '%Y-%m-%d').date()
        except ValueError:
            log_date = date.today()

        pain_level = int(data.get('pain_level', 0))
        water_intake = int(data.get('water_intake', 0))
        blood_in_urine = int(data.get('blood_in_urine', 0))
        frequent_urination = int(data.get('frequent_urination', 0))
        notes = data.get('additional_notes', '').strip() or None

        existing = SymptomLog.objects.filter(patient=patient, log_date=log_date).first()
        if existing:
            existing.pain_level = pain_level
            existing.water_intake = water_intake
            existing.blood_in_urine = blood_in_urine
            existing.frequent_urination = frequent_urination
            existing.additional_notes = notes
            existing.save()
            return send_success('Symptoms updated', {'id': existing.id})
        else:
            log = SymptomLog(
                patient=patient,
                log_date=log_date,
                pain_level=pain_level,
                water_intake=water_intake,
                blood_in_urine=blood_in_urine,
                frequent_urination=frequent_urination,
                additional_notes=notes,
            )
            log.save()
            return send_success('Symptoms logged', {'id': log.id})


@method_decorator(csrf_exempt, name='dispatch')
class MedicationsView(View):
    """GET/POST /api/tracker/medications/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        # Active medications
        meds = []
        for m in Medication.objects.filter(patient=patient, is_active=1).order_by('next_dose_time'):
            meds.append({
                'id': m.id,
                'name': m.name,
                'dosage': m.dosage,
                'frequency': m.frequency,
                'next_dose_time': str(m.next_dose_time) if m.next_dose_time else None,
                'is_active': m.is_active,
            })

        # Today's logs
        today = date.today()
        today_logs = []
        for ml in MedicationLog.objects.filter(
            patient=patient,
            taken_at__date=today
        ).select_related('medication'):
            today_logs.append({
                'medication_id': ml.medication_id,
                'status': ml.status,
                'taken_at': str(ml.taken_at),
            })

        # Adherence rate (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        week_logs = MedicationLog.objects.filter(
            patient=patient, taken_at__gte=week_ago
        )
        total = week_logs.count()
        taken = week_logs.filter(status='taken').count()
        adherence_rate = round((taken / total) * 100) if total > 0 else 100

        return send_success('Medications loaded', {
            'medications': meds,
            'today_logs': today_logs,
            'adherence_rate': adherence_rate,
            'active_count': len(meds),
        })

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        action = data.get('action', 'take')

        if action == 'add':
            for field in ['name', 'dosage', 'frequency']:
                if not data.get(field):
                    return send_error(f'Missing required field: {field}')

            med = Medication(
                patient=patient,
                name=data['name'].strip(),
                dosage=data['dosage'].strip(),
                frequency=data['frequency'].strip(),
                next_dose_time=data.get('next_dose_time') or None,
            )
            med.save()
            return send_success('Medication added', {'id': med.id})

        elif action in ('take', 'skip', 'miss'):
            if not data.get('medication_id'):
                return send_error('Missing required field: medication_id')
            status_map = {'take': 'taken', 'skip': 'skipped', 'miss': 'missed'}
            status = status_map[action]
            log = MedicationLog(
                medication_id=int(data['medication_id']),
                patient=patient,
                status=status,
            )
            log.save()
            return send_success('Medication logged', {'status': status})

        elif action == 'delete':
            if not data.get('medication_id'):
                return send_error('Missing required field: medication_id')
            Medication.objects.filter(id=int(data['medication_id']), patient=patient).update(is_active=0)
            return send_success('Medication removed')

        return send_error('Invalid action')


@method_decorator(csrf_exempt, name='dispatch')
class HydrationView(View):
    """GET/POST /api/tracker/hydration/"""

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

        # Today's hydration
        try:
            today_log = HydrationLog.objects.get(patient=patient, log_date=today)
            today_data = {'glasses': today_log.glasses, 'daily_goal': today_log.daily_goal}
        except HydrationLog.DoesNotExist:
            today_data = {'glasses': 0, 'daily_goal': 8}

        # Weekly logs
        week_ago = today - timedelta(days=7)
        weekly_logs = []
        total_glasses = 0
        streak = 0

        for log in HydrationLog.objects.filter(
            patient=patient, log_date__gte=week_ago
        ).order_by('log_date'):
            weekly_logs.append({
                'log_date': str(log.log_date),
                'glasses': log.glasses,
                'daily_goal': log.daily_goal,
            })
            total_glasses += log.glasses
            if log.glasses >= log.daily_goal:
                streak += 1

        days_logged = len(weekly_logs)
        avg_percent = round((total_glasses / (days_logged * 8)) * 100) if days_logged > 0 else 0

        return send_success('Hydration stats loaded', {
            'today': today_data,
            'weekly': weekly_logs,
            'stats': {
                'daily_goal': 8,
                'day_streak': streak,
                'avg_percent': avg_percent,
            },
        })

    def post(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'patient':
            return send_error('Access denied', 403)

        patient = _get_patient(user)
        if not patient:
            return send_error('Patient profile not found', 404)

        try:
            data = json.loads(request.body)
        except Exception:
            return send_error('Invalid JSON')

        action = data.get('action', 'add')
        amount = int(data.get('amount', 1))
        today = date.today()

        try:
            today_log = HydrationLog.objects.get(patient=patient, log_date=today)
            if action == 'add':
                new_amount = today_log.glasses + amount
            else:
                new_amount = max(0, today_log.glasses - amount)
            today_log.glasses = new_amount
            today_log.save()
        except HydrationLog.DoesNotExist:
            new_amount = amount if action == 'add' else 0
            HydrationLog(
                patient=patient,
                log_date=today,
                glasses=new_amount,
                daily_goal=8,
            ).save()

        return send_success('Hydration updated', {'glasses': new_amount})
