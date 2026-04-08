package com.simats.stentcare.models

import com.google.gson.annotations.SerializedName

// ==================== PATIENT MODELS ====================

data class PatientDashboard(
    @SerializedName("patient_name") val patientName: String,
    @SerializedName("patient_id") val patientId: String,
    @SerializedName("active_stent") val activeStent: ActiveStent?,
    val doctor: DoctorInfo?,
    @SerializedName("unread_notifications") val unreadNotifications: Int,
    @SerializedName("today_hydration") val todayHydration: TodayHydration
)

data class ActiveStent(
    val id: Int,
    @SerializedName("stent_id") val stentId: String,
    @SerializedName("insertion_date") val insertionDate: String,
    @SerializedName("expected_removal_date") val expectedRemovalDate: String,
    val status: String,
    @SerializedName("days_left") val daysLeft: Int,
    @SerializedName("days_elapsed") val daysElapsed: Int,
    @SerializedName("total_days") val totalDays: Int,
    @SerializedName("progress_percent") val progressPercent: Int
)

data class DoctorInfo(
    val id: Int,
    val specialization: String?,
    @SerializedName("full_name") val fullName: String,
    val phone: String?,
    val email: String?
)

data class TodayHydration(
    val glasses: Int,
    @SerializedName("daily_goal") val dailyGoal: Int
)

data class StentProgress(
    val stent: ActiveStent?,
    val timeline: List<TimelineEvent>
)

data class TimelineEvent(
    val event: String,
    val date: String,
    val status: String,
    val icon: String
)

data class PatientProfile(
    val id: Int,
    @SerializedName("patient_id") val patientId: String,
    val age: Int?,
    val gender: String?,
    @SerializedName("emergency_contact") val emergencyContact: String?,
    @SerializedName("blood_group") val bloodGroup: String?,
    @SerializedName("full_name") val fullName: String,
    val email: String?,
    val phone: String?,
    @SerializedName("profile_image") val profileImage: String?,
    @SerializedName("doctor_name") val doctorName: String?,
    @SerializedName("doctor_specialization") val doctorSpecialization: String?
)

// ==================== TRACKER MODELS ====================

data class SymptomLogsResponse(
    val logs: List<SymptomLog>
)

data class SymptomLog(
    val id: Int? = null,
    @SerializedName("log_date") val logDate: String,
    @SerializedName("pain_level") val painLevel: Int,
    @SerializedName("water_intake") val waterIntake: Int,
    @SerializedName("blood_in_urine") val bloodInUrine: Int,
    @SerializedName("frequent_urination") val frequentUrination: Int,
    @SerializedName("additional_notes") val additionalNotes: String?
)

data class LogSymptomsRequest(
    @SerializedName("log_date") val logDate: String? = null,
    @SerializedName("pain_level") val painLevel: Int,
    @SerializedName("water_intake") val waterIntake: Int,
    @SerializedName("blood_in_urine") val bloodInUrine: Int,
    @SerializedName("frequent_urination") val frequentUrination: Int,
    @SerializedName("additional_notes") val additionalNotes: String? = null
)

data class HydrationStats(
    val today: TodayHydration,
    val weekly: List<WeeklyHydration>,
    val stats: HydrationStatsInfo
)

data class WeeklyHydration(
    @SerializedName("log_date") val logDate: String,
    val glasses: Int,
    @SerializedName("daily_goal") val dailyGoal: Int
)

data class HydrationStatsInfo(
    @SerializedName("daily_goal") val dailyGoal: Int,
    @SerializedName("day_streak") val dayStreak: Int,
    @SerializedName("avg_percent") val avgPercent: Int
)

data class LogHydrationRequest(
    val action: String = "add",
    val amount: Int = 1
)

data class HydrationResponse(
    val glasses: Int
)

data class MedicationsResponse(
    val medications: List<Medication>,
    @SerializedName("today_logs") val todayLogs: List<MedicationLog>,
    @SerializedName("adherence_rate") val adherenceRate: Int,
    @SerializedName("active_count") val activeCount: Int
)

data class Medication(
    val id: Int,
    val name: String,
    val dosage: String?,
    val frequency: String?,
    @SerializedName("next_dose_time") val nextDoseTime: String?,
    @SerializedName("is_active") val isActive: Int
)

data class MedicationLog(
    @SerializedName("medication_id") val medicationId: Int,
    val status: String,
    @SerializedName("taken_at") val takenAt: String?
)

data class MedicationActionRequest(
    val action: String,
    @SerializedName("medication_id") val medicationId: Int? = null,
    val name: String? = null,
    val dosage: String? = null,
    val frequency: String? = null,
    @SerializedName("next_dose_time") val nextDoseTime: String? = null
)

// ==================== CHAT & NOTIFICATION MODELS ====================

data class MessagesResponse(
    val messages: List<Message>,
    val partner: ChatPartner
)

data class Message(
    val id: Int,
    @SerializedName("sender_id") val senderId: Int,
    @SerializedName("receiver_id") val receiverId: Int,
    val message: String,
    @SerializedName("is_read") val isRead: Int,
    @SerializedName("sent_at") val sentAt: String,
    @SerializedName("sender_name") val senderName: String?
)

data class ChatPartner(
    val id: Int,
    @SerializedName("full_name") val fullName: String,
    val role: String,
    @SerializedName("profile_image") val profileImage: String?
)

data class SendMessageRequest(
    @SerializedName("receiver_id") val receiverId: Int,
    val message: String
)

data class SendMessageResponse(
    val id: Int,
    @SerializedName("sent_at") val sentAt: String
)

data class NotificationsResponse(
    val notifications: List<Notification>,
    @SerializedName("unread_count") val unreadCount: Int
)

data class Notification(
    val id: Int,
    val title: String,
    val message: String?,
    val type: String,
    @SerializedName("is_read") val isRead: Int,
    @SerializedName("created_at") val createdAt: String
)

data class MarkNotificationRequest(
    val action: String = "read",
    val id: Int? = null
)

// ==================== CONSULTATION MODELS ====================

data class ConsultationsResponse(
    val upcoming: List<Consultation>,
    val past: List<Consultation>
)

data class Consultation(
    val id: Int,
    @SerializedName("patient_id") val patientId: Int?,
    @SerializedName("doctor_id") val doctorId: Int?,
    @SerializedName("consultation_type") val consultationType: String?,
    @SerializedName("scheduled_date") val scheduledDate: String,
    @SerializedName("scheduled_time") val scheduledTime: String,
    val status: String,
    @SerializedName("meeting_link") val meetingLink: String?,
    val notes: String?,
    @SerializedName("doctor_name") val doctorName: String?,
    val specialization: String?,
    @SerializedName("patient_name") val patientName: String?
)

data class ConsultationRequest(
    val action: String,
    val id: Int? = null,
    @SerializedName("patient_id") val patientId: Int? = null,
    @SerializedName("doctor_id") val doctorId: Int? = null,
    @SerializedName("scheduled_date") val scheduledDate: String? = null,
    @SerializedName("scheduled_time") val scheduledTime: String? = null,
    @SerializedName("consultation_type") val consultationType: String? = null,
    val notes: String? = null
)

// ==================== ADMIN MODELS ====================

data class AdminDashboard(
    val stats: AdminStats,
    @SerializedName("recent_activity") val recentActivity: List<RecentActivity>
)

data class AdminStats(
    @SerializedName("total_doctors") val totalDoctors: Int,
    @SerializedName("total_patients") val totalPatients: Int,
    @SerializedName("active_stents") val activeStents: Int,
    @SerializedName("total_hospitals") val totalHospitals: Int,
    @SerializedName("pending_approvals") val pendingApprovals: Int
)

data class RecentActivity(
    val activity: String,
    val detail: String,
    val time: String
)

data class PendingDoctorsResponse(
    val doctors: List<PendingDoctor>,
    val count: Int
)

data class PendingDoctor(
    val id: Int,
    @SerializedName("full_name") val fullName: String,
    val email: String,
    val phone: String?,
    @SerializedName("created_at") val createdAt: String,
    val specialization: String?,
    @SerializedName("hospital_name") val hospitalName: String?
)

data class ApproveDoctorRequest(
    @SerializedName("doctor_id") val doctorId: Int,
    val action: String
)

data class UsersResponse(
    val users: List<UserInfo>,
    val total: Int,
    val page: Int,
    val pages: Int
)

data class UserInfo(
    val id: Int,
    val role: String,
    @SerializedName("full_name") val fullName: String,
    val email: String,
    val phone: String?,
    @SerializedName("is_verified") val isVerified: Int,
    @SerializedName("is_approved") val isApproved: Int,
    @SerializedName("created_at") val createdAt: String
)

data class UserActionRequest(
    @SerializedName("user_id") val userId: Int,
    val action: String
)

data class HospitalsResponse(
    val hospitals: List<Hospital>
)

data class Hospital(
    val id: Int,
    val name: String,
    val address: String?,
    val phone: String?,
    val email: String?,
    @SerializedName("is_active") val isActive: Int,
    @SerializedName("doctor_count") val doctorCount: Int?
)

data class HospitalActionRequest(
    val action: String,
    val id: Int? = null,
    val name: String? = null,
    val address: String? = null,
    val phone: String? = null,
    val email: String? = null
)

// ==================== EDUCATION MODELS ====================

data class EducationResponse(
    val content: List<EducationContent>
)

data class EducationContent(
    val id: Int,
    val title: String,
    val description: String?,
    @SerializedName("content_type") val contentType: String,
    @SerializedName("content_url") val contentUrl: String?,
    @SerializedName("content_body") val contentBody: String?,
    @SerializedName("read_time") val readTime: String?
)
