package com.simats.stentcare.models

import com.google.gson.annotations.SerializedName

// ==================== BASE RESPONSE ====================

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)

data class UpdateProfileRequest(
    @SerializedName("full_name") val fullName: String,
    val phone: String,
    @SerializedName("profile_image") val profileImage: String? = null
)

data class ChangePasswordRequest(
    @SerializedName("current_password") val currentPassword: String,
    @SerializedName("new_password") val newPassword: String
)

// ==================== AUTH MODELS ====================

data class RegisterRequest(
    val role: String,
    val email: String,
    val password: String,
    @SerializedName("full_name") val fullName: String,
    val phone: String,
    val specialization: String? = null,
    @SerializedName("hospital_id") val hospitalId: Int? = null,
    val age: Int? = null,
    val gender: String? = null,
    @SerializedName("profile_image") val profileImage: String? = null
)

data class RegisterResponse(
    @SerializedName("user_id") val userId: Int,
    val email: String,
    val role: String,
    @SerializedName("debug_otp") val debugOtp: String?,
    @SerializedName("email_sent") val emailSent: Boolean = false
)

data class LoginRequest(
    val email: String,
    val password: String,
    val role: String
)

data class LoginResponse(
    val token: String,
    val user: User,
    val profile: Any?
)

data class User(
    val id: Int,
    val role: String,
    val email: String,
    @SerializedName("full_name") val fullName: String,
    val phone: String?,
    @SerializedName("profile_image") val profileImage: String?
)

data class OtpRequest(
    val email: String,
    val otp: String
)

data class OtpResponse(
    val verified: Boolean,
    val role: String,
    @SerializedName("is_approved") val isApproved: Boolean,
    val token: String?
)

data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val email: String,
    val otp: String,
    @SerializedName("new_password") val newPassword: String
)

data class ForgotPasswordResponse(
    @SerializedName("debug_otp") val debugOtp: String?,
    @SerializedName("email_sent") val emailSent: Boolean = false
)

// ==================== DOCTOR MODELS ====================

data class DoctorDashboard(
    @SerializedName("doctor_name") val doctorName: String,
    val stats: DoctorStats,
    @SerializedName("upcoming_removals") val upcomingRemovals: List<UpcomingRemoval>
)

data class DoctorStats(
    @SerializedName("total_patients") val totalPatients: Int,
    @SerializedName("active_stents") val activeStents: Int,
    @SerializedName("upcoming_removals") val upcomingRemovals: Int,
    @SerializedName("overdue_stents") val overdueStents: Int
)

data class UpcomingRemoval(
    @SerializedName("stent_id") val stentId: String,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String,
    @SerializedName("patient_name") val patientName: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("patient_db_id") val patientDbId: Int,
    @SerializedName("days_left") val daysLeft: Int
)

data class PatientsResponse(
    val patients: List<Patient>,
    val count: Int
)

data class Patient(
    val id: Int,
    @SerializedName("patient_id") val patientId: String,
    val age: Int?,
    val gender: String?,
    @SerializedName("full_name") val fullName: String,
    val phone: String?,
    val email: String?,
    @SerializedName("stent_id") val stentId: String?,
    @SerializedName("stent_status") val stentStatus: String?,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String?,
    @SerializedName("days_left") val daysLeft: Int?,
    @SerializedName("display_status") val displayStatus: String?,
    @SerializedName("status_color") val statusColor: String?
)

data class AddPatientRequest(
    @SerializedName("full_name") val fullName: String,
    val age: Int,
    val gender: String,
    val phone: String,
    val email: String? = null,
    @SerializedName("emergency_contact") val emergencyContact: String? = null,
    @SerializedName("blood_group") val bloodGroup: String? = null
)

data class AddPatientResponse(
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("patient_profile_id") val patientProfileId: Int,
    @SerializedName("full_name") val fullName: String,
    @SerializedName("temp_password") val tempPassword: String?,
    @SerializedName("is_existing") val isExisting: Boolean = false
)

data class PatientDetails(
    val patient: PatientInfo,
    val stents: List<Stent>,
    @SerializedName("recent_symptoms") val recentSymptoms: List<SymptomLog>
)

data class PatientInfo(
    val id: Int,
    @SerializedName("patient_id") val patientId: String,
    val age: Int?,
    val gender: String?,
    @SerializedName("emergency_contact") val emergencyContact: String?,
    @SerializedName("blood_group") val bloodGroup: String?,
    @SerializedName("full_name") val fullName: String,
    val email: String?,
    val phone: String?,
    @SerializedName("profile_image") val profileImage: String?
)

data class DoctorProfile(
    @SerializedName("doctor_id") val doctorId: Int,
    val specialization: String?,
    @SerializedName("license_number") val licenseNumber: String?,
    @SerializedName("total_patients") val totalPatients: Int,
    @SerializedName("active_stents") val activeStents: Int,
    @SerializedName("full_name") val fullName: String,
    val email: String,
    val phone: String?,
    @SerializedName("profile_image") val profileImage: String?,
    @SerializedName("hospital_name") val hospitalName: String?,
    @SerializedName("hospital_address") val hospitalAddress: String?,
    @SerializedName("upcoming_removals") val upcomingRemovals: Int
)

data class CalendarResponse(
    val month: Int,
    val year: Int,
    val calendar: Map<String, List<CalendarEvent>>,
    val summary: CalendarSummary
)

data class CalendarEvent(
    val id: Int,
    @SerializedName("stent_id") val stentId: String?,
    @SerializedName("event_date") val eventDate: String,
    @SerializedName("event_type") val eventType: String,
    @SerializedName("patient_name") val patientName: String,
    @SerializedName("patient_id") val patientId: String?,
    val status: String?
)

data class CalendarSummary(
    @SerializedName("total_insertions") val totalInsertions: Int,
    @SerializedName("total_removals") val totalRemovals: Int,
    @SerializedName("total_consultations") val totalConsultations: Int
)

data class DoctorCalendarResponse(
    val events: List<CalendarEventSimple>,
    val summary: CalendarSummary?
)

data class CalendarEventSimple(
    val id: Int,
    val title: String,
    val date: String,
    val type: String,
    @SerializedName("patient_name") val patientName: String?,
    @SerializedName("stent_id") val stentId: String?
)

// ==================== STENT MODELS ====================

data class Stent(
    val id: Int,
    @SerializedName("stent_id") val stentId: String,
    @SerializedName("insertion_date") val insertionDate: String,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String,
    @SerializedName("actual_removal_date") val actualRemovalDate: String?,
    val status: String,
    val notes: String?,
    @SerializedName("days_left") val daysLeft: Int?,
    @SerializedName("days_elapsed") val daysElapsed: Int?,
    @SerializedName("total_days") val totalDays: Int?,
    val progress: Int?
)

data class AddStentRequest(
    @SerializedName("patient_id") val patientId: Int,
    @SerializedName("stent_id") val stentId: String? = null,
    @SerializedName("insertion_date") val insertionDate: String,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String,
    @SerializedName("stent_type") val stentType: String? = null,
    val side: String? = null,
    val notes: String? = null
)

data class StentResponse(
    val id: Int,
    @SerializedName("stent_id") val stentId: String,
    @SerializedName("insertion_date") val insertionDate: String,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String,
    val status: String
)

data class StentDetails(
    val id: Int,
    @SerializedName("stent_id") val stentId: String,
    @SerializedName("patient_id") val patientId: Int,
    @SerializedName("doctor_id") val doctorId: Int,
    @SerializedName("insertion_date") val insertionDate: String,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String,
    @SerializedName("actual_removal_date") val actualRemovalDate: String?,
    val status: String,
    val notes: String?,
    @SerializedName("stent_type") val stentType: String?,
    val side: String?,
    @SerializedName("patient_code") val patientCode: String?,
    @SerializedName("patient_name") val patientName: String?,
    @SerializedName("doctor_name") val doctorName: String?,
    @SerializedName("days_left") val daysLeft: Int?,
    @SerializedName("days_elapsed") val daysElapsed: Int?,
    @SerializedName("total_days") val totalDays: Int?,
    @SerializedName("progress_percent") val progressPercent: Int?
)

data class UpdateStentRequest(
    val id: Int,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String? = null,
    val notes: String? = null,
    val status: String? = null
)
