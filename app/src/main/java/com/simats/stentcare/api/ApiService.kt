package com.simats.stentcare.api

import com.simats.stentcare.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    
    // ==================== AUTH ====================
    
    @POST("auth/register/")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<RegisterResponse>>
    
    @POST("auth/login/")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<LoginResponse>>
    
    @POST("auth/verify_otp/")
    suspend fun verifyOtp(@Body request: OtpRequest): Response<ApiResponse<OtpResponse>>
    
    @POST("auth/forgot_password/")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ApiResponse<ForgotPasswordResponse>>
    
    @POST("auth/reset_password/")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ApiResponse<Any>>
    
    // ==================== DOCTOR ====================
    
    @GET("doctor/dashboard/")
    suspend fun getDoctorDashboard(): Response<ApiResponse<DoctorDashboard>>
    
    @GET("doctor/patients/")
    suspend fun getPatients(
        @Query("search") search: String? = null,
        @Query("status") status: String? = null
    ): Response<ApiResponse<PatientsResponse>>
    
    @POST("doctor/add_patient/")
    suspend fun addPatient(@Body request: AddPatientRequest): Response<ApiResponse<AddPatientResponse>>
    
    @GET("doctor/patient_details/")
    suspend fun getPatientDetails(@Query("id") patientId: Int): Response<ApiResponse<PatientDetails>>
    
    @GET("doctor/calendar/")
    suspend fun getCalendar(
        @Query("month") month: Int,
        @Query("year") year: Int
    ): Response<ApiResponse<CalendarResponse>>
    
    @GET("doctor/profile/")
    suspend fun getDoctorProfile(): Response<ApiResponse<DoctorProfile>>

    @PUT("doctor/update_profile/")
    suspend fun updateDoctorProfile(@Body request: UpdateProfileRequest): Response<ApiResponse<Any>>

    @PUT("patient/update_profile/")
    suspend fun updatePatientProfile(@Body request: UpdateProfileRequest): Response<ApiResponse<Any>>

    @POST("auth/change_password/")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<ApiResponse<Any>>

    // ==================== STENT ====================
    
    @POST("stent/add/")
    suspend fun addStent(@Body request: AddStentRequest): Response<ApiResponse<StentResponse>>
    
    @GET("stent/details/")
    suspend fun getStentDetails(@Query("id") stentId: Int): Response<ApiResponse<StentDetails>>
    
    @POST("stent/update/")
    suspend fun updateStent(@Body request: UpdateStentRequest): Response<ApiResponse<Any>>
    
    // ==================== PATIENT ====================
    
    @GET("patient/dashboard/")
    suspend fun getPatientDashboard(): Response<ApiResponse<PatientDashboard>>
    
    @GET("patient/stent_progress/")
    suspend fun getStentProgress(): Response<ApiResponse<StentProgress>>
    
    @GET("patient/profile/")
    suspend fun getPatientProfile(): Response<ApiResponse<PatientProfile>>
    
    // ==================== TRACKERS ====================
    
    @GET("tracker/symptoms/")
    suspend fun getSymptomLogs(@Query("limit") limit: Int = 30): Response<ApiResponse<SymptomLogsResponse>>
    
    @POST("tracker/symptoms/")
    suspend fun logSymptoms(@Body request: LogSymptomsRequest): Response<ApiResponse<Any>>
    
    @GET("tracker/hydration/")
    suspend fun getHydrationStats(): Response<ApiResponse<HydrationStats>>
    
    @POST("tracker/hydration/")
    suspend fun logHydration(@Body request: LogHydrationRequest): Response<ApiResponse<HydrationResponse>>
    
    @GET("tracker/medications/")
    suspend fun getMedications(): Response<ApiResponse<MedicationsResponse>>
    
    @POST("tracker/medications/")
    suspend fun medicationAction(@Body request: MedicationActionRequest): Response<ApiResponse<Any>>
    
    // ==================== CHAT ====================
    
    @GET("chat/messages/")
    suspend fun getMessages(
        @Query("user_id") userId: Int,
        @Query("limit") limit: Int = 50
    ): Response<ApiResponse<MessagesResponse>>
    
    @POST("chat/messages/")
    suspend fun sendMessage(@Body request: SendMessageRequest): Response<ApiResponse<SendMessageResponse>>
    
    // ==================== NOTIFICATIONS ====================
    
    @GET("notifications/")
    suspend fun getNotifications(
        @Query("limit") limit: Int = 20,
        @Query("unread_only") unreadOnly: String = "false"
    ): Response<ApiResponse<NotificationsResponse>>
    
    @POST("notifications/")
    suspend fun markNotificationRead(@Body request: MarkNotificationRequest): Response<ApiResponse<Any>>
    
    // ==================== CONSULTATIONS ====================
    
    @GET("consultations/")
    suspend fun getConsultations(@Query("status") status: String? = null): Response<ApiResponse<ConsultationsResponse>>
    
    @POST("consultations/")
    suspend fun consultationAction(@Body request: ConsultationRequest): Response<ApiResponse<Any>>
    
    // ==================== ADMIN ====================
    
    @GET("admin/dashboard/")
    suspend fun getAdminDashboard(): Response<ApiResponse<AdminDashboard>>
    
    @GET("admin/doctor_approvals/")
    suspend fun getPendingDoctors(): Response<ApiResponse<PendingDoctorsResponse>>
    
    @POST("admin/doctor_approvals/")
    suspend fun approveDoctor(@Body request: ApproveDoctorRequest): Response<ApiResponse<Any>>
    
    @GET("admin/users/")
    suspend fun getUsers(
        @Query("role") role: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int = 1
    ): Response<ApiResponse<UsersResponse>>
    
    @POST("admin/users/")
    suspend fun userAction(@Body request: UserActionRequest): Response<ApiResponse<Any>>
    
    @GET("admin/hospitals/")
    suspend fun getHospitals(): Response<ApiResponse<HospitalsResponse>>
    
    @POST("admin/hospitals/")
    suspend fun hospitalAction(@Body request: HospitalActionRequest): Response<ApiResponse<Any>>

    @GET("admin/update_profile/")
    suspend fun getAdminProfile(): Response<ApiResponse<User>>

    @PUT("admin/update_profile/")
    suspend fun updateAdminProfile(@Body request: UpdateProfileRequest): Response<ApiResponse<Any>>
    
    // ==================== EDUCATION ====================
    
    @GET("education/")
    suspend fun getEducationContent(
        @Query("type") type: String? = null,
        @Query("search") search: String? = null
    ): Response<ApiResponse<EducationResponse>>
}
