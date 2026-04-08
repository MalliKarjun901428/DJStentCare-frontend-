from django.db import models


class User(models.Model):
    ROLE_CHOICES = [('doctor', 'Doctor'), ('patient', 'Patient'), ('admin', 'Admin')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    email = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=255)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, null=True, blank=True)
    profile_image = models.CharField(max_length=255, null=True, blank=True)
    is_verified = models.IntegerField(default=0)
    is_approved = models.IntegerField(default=1)
    otp_code = models.CharField(max_length=6, null=True, blank=True)
    otp_expiry = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        managed = False  # Use existing MySQL tables


class Hospital(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hospitals'
        managed = False


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_id')
    specialization = models.CharField(max_length=100, null=True, blank=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True, db_column='hospital_id')
    license_number = models.CharField(max_length=50, null=True, blank=True)
    total_patients = models.IntegerField(default=0)
    active_stents = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'doctors'
        managed = False


class Patient(models.Model):
    GENDER_CHOICES = [('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    user = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_id')
    patient_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, db_column='doctor_id')
    emergency_contact = models.CharField(max_length=20, null=True, blank=True)
    blood_group = models.CharField(max_length=10, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patients'
        managed = False


class Stent(models.Model):
    STATUS_CHOICES = [('active', 'Active'), ('removed', 'Removed'), ('overdue', 'Overdue')]
    stent_id = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, db_column='doctor_id')
    insertion_date = models.DateField()
    expected_removal_date = models.DateField()
    actual_removal_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stents'
        managed = False


class SymptomLog(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id')
    log_date = models.DateField()
    pain_level = models.IntegerField(default=0)
    water_intake = models.IntegerField(default=0)
    blood_in_urine = models.IntegerField(default=0)
    frequent_urination = models.IntegerField(default=0)
    additional_notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'symptom_logs'
        managed = False


class Medication(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id')
    name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50, null=True, blank=True)
    frequency = models.CharField(max_length=50, null=True, blank=True)
    next_dose_time = models.TimeField(null=True, blank=True)
    is_active = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'medications'
        managed = False


class MedicationLog(models.Model):
    STATUS_CHOICES = [('taken', 'Taken'), ('missed', 'Missed'), ('skipped', 'Skipped')]
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, db_column='medication_id')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id')
    taken_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='taken')

    class Meta:
        db_table = 'medication_logs'
        managed = False


class HydrationLog(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id')
    log_date = models.DateField()
    glasses = models.IntegerField(default=0)
    daily_goal = models.IntegerField(default=8)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'hydration_logs'
        managed = False
        unique_together = [('patient', 'log_date')]


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', db_column='sender_id')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', db_column='receiver_id')
    message = models.TextField()
    is_read = models.IntegerField(default=0)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        managed = False


class Consultation(models.Model):
    STATUS_CHOICES = [('scheduled', 'Scheduled'), ('completed', 'Completed'), ('cancelled', 'Cancelled')]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, db_column='patient_id')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, db_column='doctor_id')
    consultation_type = models.CharField(max_length=50, null=True, blank=True)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    meeting_link = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'consultations'
        managed = False


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    title = models.CharField(max_length=200)
    message = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=50, default='info')
    is_read = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        managed = False


class EducationContent(models.Model):
    TYPE_CHOICES = [('video', 'Video'), ('article', 'Article'), ('faq', 'FAQ')]
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    content_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    content_url = models.CharField(max_length=255, null=True, blank=True)
    content_body = models.TextField(null=True, blank=True)
    read_time = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'education_content'
        managed = False
