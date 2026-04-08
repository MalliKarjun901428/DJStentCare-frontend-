package com.simats.stentcare.ui.patient

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.ui.common.NotificationsActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.card.MaterialCardView
import com.google.android.material.progressindicator.CircularProgressIndicator
import kotlinx.coroutines.launch

class PatientDashboardActivity : AppCompatActivity() {

    private lateinit var tvWelcome: TextView
    private lateinit var tvPatientId: TextView
    private lateinit var tvDaysLeft: TextView
    private lateinit var tvInsertedDate: TextView
    private lateinit var tvRemovalDate: TextView
    private lateinit var progressStent: CircularProgressIndicator
    private lateinit var tvProgress: TextView
    private lateinit var tvDoctorName: TextView
    private lateinit var tvHydrationProgress: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var cardStentStatus: MaterialCardView

    private var assignedDoctorId = 0
    private var assignedDoctorName = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_patient_dashboard)

        initViews()
        setupBottomNav()
        setupQuickActions()
        loadDashboard()
    }

    private fun initViews() {
        tvWelcome       = findViewById(R.id.tvWelcome)
        tvPatientId     = findViewById(R.id.tvPatientId)
        tvDaysLeft      = findViewById(R.id.tvDaysLeft)
        tvInsertedDate  = findViewById(R.id.tvInsertedDate)
        tvRemovalDate   = findViewById(R.id.tvRemovalDate)
        progressStent   = findViewById(R.id.progressStent)
        tvProgress      = findViewById(R.id.tvProgress)
        tvDoctorName    = findViewById(R.id.tvDoctorName)
        tvHydrationProgress = findViewById(R.id.tvHydrationProgress)
        progressBar     = findViewById(R.id.progressBar)
        cardStentStatus = findViewById(R.id.cardStentStatus)

        val userName = DJStentCareApp.instance.getUserName() ?: "Patient"
        tvWelcome.text = "Hello, $userName"

        // 🔔 Notification icon
        findViewById<ImageView>(R.id.ivNotification).setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }

        // 💬 Message doctor button
        findViewById<Button>(R.id.btnMessage).setOnClickListener {
            openChat()
        }
    }

    private fun setupBottomNav() {
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNav)
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home     -> true
                R.id.nav_progress -> {
                    startActivity(Intent(this, StentProgressActivity::class.java))
                    true
                }
                R.id.nav_doctor   -> {
                    openChat()
                    true
                }
                R.id.nav_profile  -> {
                    startActivity(Intent(this, PatientProfileActivity::class.java))
                    true
                }
                else -> false
            }
        }
    }

    private fun openChat() {
        val intent = Intent(this, ChatActivity::class.java)
        intent.putExtra("doctor_id", assignedDoctorId)
        intent.putExtra("doctor_name", assignedDoctorName)
        startActivity(intent)
    }

    private fun setupQuickActions() {
        findViewById<MaterialCardView>(R.id.cardSymptoms).setOnClickListener {
            startActivity(Intent(this, SymptomTrackerActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardHydration).setOnClickListener {
            startActivity(Intent(this, HydrationTrackerActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardMedications).setOnClickListener {
            startActivity(Intent(this, MedicationTrackerActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardVideoCall).setOnClickListener {
            startActivity(Intent(this, VideoConsultationActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardLearn).setOnClickListener {
            startActivity(Intent(this, EducationLibraryActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardEmergency).setOnClickListener {
            startActivity(Intent(this, EmergencyActivity::class.java))
        }
        cardStentStatus.setOnClickListener {
            startActivity(Intent(this, StentProgressActivity::class.java))
        }
    }

    private fun loadDashboard() {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getPatientDashboard()

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data ?: return@launch

                    tvPatientId.text = "ID: ${data.patientId}"

                    val stent = data.activeStent
                    if (stent != null) {
                        cardStentStatus.visibility = View.VISIBLE
                        tvDaysLeft.text = "${stent.daysLeft}"
                        tvInsertedDate.text = stent.insertionDate
                        tvRemovalDate.text = stent.expectedRemovalDate
                        progressStent.progress = stent.progressPercent
                        tvProgress.text = "${stent.progressPercent}%"

                        // Color based on urgency — use ContextCompat for API compatibility
                        val colorRes = when {
                            stent.daysLeft < 0  -> R.color.error
                            stent.daysLeft <= 7 -> R.color.warning
                            else                -> R.color.success
                        }
                        val color = ContextCompat.getColor(this@PatientDashboardActivity, colorRes)
                        tvDaysLeft.setTextColor(color)
                        progressStent.setIndicatorColor(color)
                    } else {
                        cardStentStatus.visibility = View.GONE
                    }

                    data.doctor?.let {
                        assignedDoctorId = it.id
                        assignedDoctorName = "Dr. ${it.fullName}"
                        tvDoctorName.text = assignedDoctorName
                    }

                    val hydration = data.todayHydration
                    tvHydrationProgress.text = "${hydration.glasses}/${hydration.dailyGoal}"

                } else {
                    Toast.makeText(this@PatientDashboardActivity,
                        "Failed to load dashboard", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@PatientDashboardActivity,
                    "Connection error: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }

    override fun onResume() {
        super.onResume()
        loadDashboard()
    }
}
