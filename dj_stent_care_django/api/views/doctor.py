"""
Doctor Views
Mirrors: api/doctor/{dashboard,patients,add_patient,patient_details,profile,calendar}.php
"""

import json
from datetime import date, datetime
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

from api.models import User, Doctor, Patient, Hospital, Stent, SymptomLog, Consultation
from api.utils import send_success, send_error, get_auth_user, generate_id, hash_password


def _get_doctor(user):
    """Helper: get Doctor object for a user, or None."""
    try:
        return Doctor.objects.select_related('hospital').get(user=user)
    except Doctor.DoesNotExist:
        return None


@method_decorator(csrf_exempt, name='dispatch')
class DashboardView(View):
    """GET /api/doctor/dashboard/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
            return send_error('Access denied. Doctor role required.', 403)

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        today = date.today()

        total_patients = Patient.objects.filter(doctor=doctor).count()
        active_stents = Stent.objects.filter(doctor=doctor, status='active').count()

        from datetime import timedelta
        in_7_days = today + timedelta(days=7)
        upcoming_removals_count = Stent.objects.filter(
            doctor=doctor, status='active',
            expected_removal_date__gte=today,
            expected_removal_date__lte=in_7_days
        ).count()

        overdue_stents = Stent.objects.filter(
            doctor=doctor, status='active',
            expected_removal_date__lt=today
        ).count()

        # Upcoming removals list (top 5)
        upcoming_list = []
        stents_qs = Stent.objects.filter(
            doctor=doctor, status='active'
        ).select_related('patient__user').order_by('expected_removal_date')[:5]

        for s in stents_qs:
            days_left = (s.expected_removal_date - today).days
            upcoming_list.append({
                'stent_id': s.stent_id,
                'expected_removal_date': str(s.expected_removal_date),
                'patient_name': s.patient.user.full_name,
                'patient_id': s.patient.patient_id,
                'patient_db_id': s.patient.id,  # Integer DB id for Android navigation
                'days_left': days_left,
            })

        return send_success('Dashboard loaded', {
            'doctor_name': user.full_name,
            'stats': {
                'total_patients': total_patients,
                'active_stents': active_stents,
                'upcoming_removals': upcoming_removals_count,
                'overdue_stents': overdue_stents,
            },
            'upcoming_removals': upcoming_list,
        })


@method_decorator(csrf_exempt, name='dispatch')
class PatientsView(View):
    """GET /api/doctor/patients/?search=&status="""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
            return send_error('Access denied', 403)

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        search = request.GET.get('search', '').strip()
        status_filter = request.GET.get('status', '').strip()

        patients_qs = Patient.objects.filter(doctor=doctor).select_related('user')
        if search:
            patients_qs = patients_qs.filter(
                Q(user__full_name__icontains=search) | Q(patient_id__icontains=search)
            )
        patients_qs = patients_qs.order_by('user__full_name')

        today = date.today()
        patients_data = []

        for p in patients_qs:
            # Get active stent
            active_stent = Stent.objects.filter(patient=p, status='active').order_by('-insertion_date').first()

            row = {
                'id': p.id,
                'patient_id': p.patient_id,
                'age': p.age,
                'gender': p.gender,
                'full_name': p.user.full_name,
                'phone': p.user.phone,
                'email': p.user.email,
                'stent_id': active_stent.stent_id if active_stent else None,
                'stent_status': active_stent.status if active_stent else None,
                'expected_removal_date': str(active_stent.expected_removal_date) if active_stent else None,
                'days_left': (active_stent.expected_removal_date - today).days if active_stent else None,
            }

            if active_stent:
                days_left = row['days_left']
                if days_left < 0:
                    row['display_status'] = 'Overdue'
                    row['status_color'] = 'red'
                elif days_left <= 7:
                    row['display_status'] = 'Due Soon'
                    row['status_color'] = 'orange'
                else:
                    row['display_status'] = 'Active'
                    row['status_color'] = 'green'
            else:
                row['display_status'] = 'No Active Stent'
                row['status_color'] = 'gray'

            # Filter by status
            if status_filter:
                if status_filter == 'active' and row['display_status'] != 'Active':
                    continue
                if status_filter == 'due_soon' and row['display_status'] != 'Due Soon':
                    continue
                if status_filter == 'overdue' and row['display_status'] != 'Overdue':
                    continue

            patients_data.append(row)

        return send_success('Patients retrieved', {
            'patients': patients_data,
            'count': len(patients_data),
        })


@method_decorator(csrf_exempt, name='dispatch')
class AddPatientView(View):
    """POST /api/doctor/add_patient/"""

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

        # full_name and phone are required; age and gender optional for existing patients
        if not data.get('full_name') or not data.get('phone'):
            return send_error('Missing required fields: full_name, phone')

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        full_name         = data['full_name'].strip()
        phone             = data['phone'].strip()
        age               = int(data['age']) if data.get('age') else None
        gender            = data.get('gender', 'Other').strip()
        email             = data.get('email', '').strip() or None
        emergency_contact = data.get('emergency_contact', '').strip() or None
        blood_group       = data.get('blood_group', '').strip() or None

        # ─── STEP 1: Try to find an existing user by phone (or by email) ───────
        existing_user = None
        try:
            existing_user = User.objects.get(phone=phone)
        except User.DoesNotExist:
            if email:
                try:
                    existing_user = User.objects.get(email=email)
                except User.DoesNotExist:
                    pass

        if existing_user:
            # Only link patients, not other doctors/admins
            if existing_user.role != 'patient':
                return send_error(f'The account with phone {phone} is not a patient account')

            # Get or create the patient profile for this existing user
            patient, created = Patient.objects.get_or_create(
                user=existing_user,
                defaults={
                    'patient_id': generate_id('PT'),
                    'age': age,
                    'gender': gender,
                    'doctor': doctor,
                    'emergency_contact': emergency_contact,
                    'blood_group': blood_group,
                }
            )

            if not created:
                # Patient profile already exists — just update doctor assignment + details
                if patient.doctor and patient.doctor.id == doctor.id:
                    return send_error(f'{existing_user.full_name} is already your patient')
                patient.doctor = doctor
                if age: patient.age = age
                if gender: patient.gender = gender
                if emergency_contact: patient.emergency_contact = emergency_contact
                if blood_group: patient.blood_group = blood_group
                patient.save()

            # Update the user's name if doctor entered it
            existing_user.full_name = full_name
            existing_user.is_verified = 1
            existing_user.is_approved = 1
            existing_user.save()

            # Increment doctor's patient count
            Doctor.objects.filter(id=doctor.id).update(total_patients=doctor.total_patients + 1)

            # Send notification to existing patient
            try:
                from api.models import Notification
                Notification.objects.create(
                    user=existing_user,
                    title='Doctor Assigned',
                    message=f'Dr. {user.full_name} has been assigned as your doctor. You can now see your stent details and use all features in the app.',
                    type='info',
                    is_read=0,
                )
            except Exception:
                pass

            return send_success('Patient linked to your account successfully', {
                'patient_id': patient.patient_id,
                'patient_profile_id': patient.id,
                'full_name': existing_user.full_name,
                'is_existing': True,
            })

        # ─── STEP 2: No existing user found — create new patient account ───────
        email_value = email if email else f'{phone}@stentcare.temp'
        patient_id  = generate_id('PT')

        new_user = User(
            role='patient',
            email=email_value,
            password=hash_password('patient123'),
            full_name=full_name,
            phone=phone,
            is_verified=1,
            is_approved=1,
        )
        new_user.save()

        new_patient = Patient(
            user=new_user,
            patient_id=patient_id,
            age=age,
            gender=gender,
            doctor=doctor,
            emergency_contact=emergency_contact,
            blood_group=blood_group,
        )
        new_patient.save()

        Doctor.objects.filter(id=doctor.id).update(total_patients=doctor.total_patients + 1)

        try:
            from api.models import Notification
            Notification.objects.create(
                user=new_user,
                title='Welcome to DJ Stent Care',
                message=f'Dr. {user.full_name} has added you as their patient. Your temporary login password is: patient123. Please log in and change your password.',
                type='info',
                is_read=0,
            )
        except Exception:
            pass

        return send_success('Patient added successfully', {
            'patient_id': patient_id,
            'patient_profile_id': new_patient.id,
            'full_name': full_name,
            'is_existing': False,
            'temp_password': 'patient123',
        })


@method_decorator(csrf_exempt, name='dispatch')
class PatientDetailsView(View):
    """GET /api/doctor/patient_details/?id=<patient_profile_id>"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
            return send_error('Access denied', 403)

        patient_profile_id = request.GET.get('id')
        if not patient_profile_id:
            return send_error('Patient ID required')

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        try:
            patient = Patient.objects.select_related('user').get(
                id=int(patient_profile_id), doctor=doctor
            )
        except Patient.DoesNotExist:
            return send_error('Patient not found', 404)

        patient_data = {
            'id': patient.id,
            'patient_id': patient.patient_id,
            'age': patient.age,
            'gender': patient.gender,
            'emergency_contact': patient.emergency_contact,
            'blood_group': patient.blood_group,
            'full_name': patient.user.full_name,
            'email': patient.user.email,
            'phone': patient.user.phone,
            'profile_image': patient.user.profile_image,
        }

        today = date.today()
        stents_data = []
        for s in Stent.objects.filter(patient=patient).order_by('-insertion_date'):
            days_left = (s.expected_removal_date - today).days
            days_elapsed = (today - s.insertion_date).days
            total_days = (s.expected_removal_date - s.insertion_date).days
            stent_dict = {
                'id': s.id,
                'stent_id': s.stent_id,
                'insertion_date': str(s.insertion_date),
                'expected_removal_date': str(s.expected_removal_date),
                'actual_removal_date': str(s.actual_removal_date) if s.actual_removal_date else None,
                'status': s.status,
                'notes': s.notes,
                'days_left': days_left,
                'days_elapsed': days_elapsed,
                'total_days': total_days,
            }
            if s.status == 'active' and total_days > 0:
                stent_dict['progress'] = min(100, max(0, round((days_elapsed / total_days) * 100)))
            stents_data.append(stent_dict)

        symptom_logs = []
        for log in SymptomLog.objects.filter(patient=patient).order_by('-log_date')[:7]:
            symptom_logs.append({
                'log_date': str(log.log_date),
                'pain_level': log.pain_level,
                'water_intake': log.water_intake,
                'blood_in_urine': log.blood_in_urine,
                'frequent_urination': log.frequent_urination,
            })

        return send_success('Patient details retrieved', {
            'patient': patient_data,
            'stents': stents_data,
            'recent_symptoms': symptom_logs,
        })


@method_decorator(csrf_exempt, name='dispatch')
class ProfileView(View):
    """GET /api/doctor/profile/"""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
            return send_error('Access denied', 403)

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        today = date.today()
        from datetime import timedelta
        in_7_days = today + timedelta(days=7)
        upcoming_count = Stent.objects.filter(
            doctor=doctor, status='active',
            expected_removal_date__gte=today,
            expected_removal_date__lte=in_7_days
        ).count()

        return send_success('Profile loaded', {
            'doctor_id': doctor.id,
            'specialization': doctor.specialization,
            'license_number': doctor.license_number,
            'total_patients': doctor.total_patients,
            'active_stents': doctor.active_stents,
            'upcoming_removals': upcoming_count,
            'full_name': user.full_name,
            'email': user.email,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'hospital_name': doctor.hospital.name if doctor.hospital else None,
            'hospital_address': doctor.hospital.address if doctor.hospital else None,
        })


@method_decorator(csrf_exempt, name='dispatch')
class CalendarView(View):
    """GET /api/doctor/calendar/?month=&year="""

    def get(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
            return send_error('Access denied', 403)

        doctor = _get_doctor(user)
        if not doctor:
            return send_error('Doctor profile not found', 404)

        today = date.today()
        month = int(request.GET.get('month', today.month))
        year = int(request.GET.get('year', today.year))

        # Stent insertions this month
        insertions = []
        for s in Stent.objects.filter(
            doctor=doctor,
            insertion_date__month=month,
            insertion_date__year=year
        ).select_related('patient__user'):
            insertions.append({
                'id': s.id,
                'stent_id': s.stent_id,
                'event_date': str(s.insertion_date),
                'event_type': 'insertion',
                'patient_name': s.patient.user.full_name,
                'patient_id': s.patient.patient_id,
            })

        # Stent removals this month
        removals = []
        for s in Stent.objects.filter(
            doctor=doctor,
            expected_removal_date__month=month,
            expected_removal_date__year=year,
            status__in=['active', 'overdue']
        ).select_related('patient__user'):
            removals.append({
                'id': s.id,
                'stent_id': s.stent_id,
                'event_date': str(s.expected_removal_date),
                'event_type': 'removal',
                'patient_name': s.patient.user.full_name,
                'patient_id': s.patient.patient_id,
                'status': s.status,
            })

        # Consultations this month
        consultations_list = []
        for c in Consultation.objects.filter(
            doctor=doctor,
            scheduled_date__month=month,
            scheduled_date__year=year
        ).select_related('patient__user'):
            consultations_list.append({
                'id': c.id,
                'event_date': str(c.scheduled_date),
                'scheduled_time': str(c.scheduled_time),
                'consultation_type': c.consultation_type,
                'status': c.status,
                'event_type': 'consultation',
                'patient_name': c.patient.user.full_name,
                'patient_id': c.patient.patient_id,
            })

        # Combine and group by date
        all_events = insertions + removals + consultations_list
        all_events.sort(key=lambda e: e['event_date'])

        calendar_dict = {}
        for event in all_events:
            d = event['event_date']
            if d not in calendar_dict:
                calendar_dict[d] = []
            calendar_dict[d].append(event)

        return send_success('Calendar loaded', {
            'month': month,
            'year': year,
            'calendar': calendar_dict,
            'summary': {
                'total_insertions': len(insertions),
                'total_removals': len(removals),
                'total_consultations': len(consultations_list),
            },
        })


@method_decorator(csrf_exempt, name='dispatch')
class UpdateProfileView(View):
    """PUT /api/doctor/profile/   — update doctor's own profile"""

    def put(self, request):
        user = get_auth_user(request)
        if not user:
            return send_error('Unauthorized', 401)
        if user.role != 'doctor':
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
