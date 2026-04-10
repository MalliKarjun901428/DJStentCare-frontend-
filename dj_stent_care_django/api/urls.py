"""
URL Configuration for DJ Stent Care API
Maps all endpoints to match the PHP backend URL structure,
now served by Django views.
"""

from django.urls import path

from api.views.auth import (
    RegisterView, LoginView, VerifyOTPView,
    ForgotPasswordView, ResetPasswordView, ChangePasswordView,
)
from api.views.doctor import (
    DashboardView as DoctorDashboardView,
    PatientsView, AddPatientView, PatientDetailsView,
    ProfileView as DoctorProfileView, CalendarView,
    UpdateProfileView as DoctorUpdateProfileView,
)
from api.views.stent import AddStentView, UpdateStentView, StentDetailsView
from api.views.patient import (
    DashboardView as PatientDashboardView,
    ProfileView as PatientProfileView,
    StentProgressView,
    UpdateProfileView as PatientUpdateProfileView,
)
from api.views.tracker import SymptomsView, HydrationView, MedicationsView
from api.views.chat import MessagesView
from api.views.notifications import NotificationsView
from api.views.consultations import ConsultationsView
from api.views.admin import (
    AdminDashboardView, DoctorApprovalsView, UsersView, HospitalsView,
    UpdateProfileView as AdminUpdateProfileView,
)
from api.views.education import EducationView

urlpatterns = [
    # ==================== AUTH ====================
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/verify_otp/', VerifyOTPView.as_view(), name='auth-verify-otp'),
    path('auth/forgot_password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('auth/reset_password/', ResetPasswordView.as_view(), name='auth-reset-password'),
    path('auth/change_password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # ==================== DOCTOR ====================
    path('doctor/dashboard/', DoctorDashboardView.as_view(), name='doctor-dashboard'),
    path('doctor/patients/', PatientsView.as_view(), name='doctor-patients'),
    path('doctor/add_patient/', AddPatientView.as_view(), name='doctor-add-patient'),
    path('doctor/patient_details/', PatientDetailsView.as_view(), name='doctor-patient-details'),
    path('doctor/profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('doctor/calendar/', CalendarView.as_view(), name='doctor-calendar'),
    path('doctor/update_profile/', DoctorUpdateProfileView.as_view(), name='doctor-update-profile'),

    # ==================== STENT ====================
    path('stent/add/', AddStentView.as_view(), name='stent-add'),
    path('stent/update/', UpdateStentView.as_view(), name='stent-update'),
    path('stent/details/', StentDetailsView.as_view(), name='stent-details'),

    # ==================== PATIENT ====================
    path('patient/dashboard/', PatientDashboardView.as_view(), name='patient-dashboard'),
    path('patient/profile/', PatientProfileView.as_view(), name='patient-profile'),
    path('patient/stent_progress/', StentProgressView.as_view(), name='patient-stent-progress'),
    path('patient/update_profile/', PatientUpdateProfileView.as_view(), name='patient-update-profile'),

    # ==================== TRACKERS ====================
    path('tracker/symptoms/', SymptomsView.as_view(), name='tracker-symptoms'),
    path('tracker/hydration/', HydrationView.as_view(), name='tracker-hydration'),
    path('tracker/medications/', MedicationsView.as_view(), name='tracker-medications'),

    # ==================== CHAT ====================
    path('chat/messages/', MessagesView.as_view(), name='chat-messages'),

    # ==================== NOTIFICATIONS ====================
    path('notifications/', NotificationsView.as_view(), name='notifications'),

    # ==================== CONSULTATIONS ====================
    path('consultations/', ConsultationsView.as_view(), name='consultations'),

    # ==================== ADMIN ====================
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/doctor_approvals/', DoctorApprovalsView.as_view(), name='admin-doctor-approvals'),
    path('admin/users/', UsersView.as_view(), name='admin-users'),
    path('admin/hospitals/', HospitalsView.as_view(), name='admin-hospitals'),
    path('admin/update_profile/', AdminUpdateProfileView.as_view(), name='admin-update-profile'),

    # ==================== EDUCATION ====================
    path('education/', EducationView.as_view(), name='education'),
]
