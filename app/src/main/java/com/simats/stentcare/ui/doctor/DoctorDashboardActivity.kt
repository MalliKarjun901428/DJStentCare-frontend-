package com.simats.stentcare.ui.doctor

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.ui.auth.RoleSelectionActivity
import com.simats.stentcare.ui.common.NotificationsActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.card.MaterialCardView
import kotlinx.coroutines.launch

class DoctorDashboardActivity : AppCompatActivity() {

    private lateinit var tvWelcome: TextView
    private lateinit var tvTotalPatients: TextView
    private lateinit var tvActiveStents: TextView
    private lateinit var tvUpcoming: TextView
    private lateinit var tvOverdue: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var rvUpcoming: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_doctor_dashboard)

        initViews()
        setupBottomNav()
        setupQuickActions()
        loadDashboard()
    }

    private fun initViews() {
        tvWelcome = findViewById(R.id.tvWelcome)
        tvTotalPatients = findViewById(R.id.tvTotalPatients)
        tvActiveStents = findViewById(R.id.tvActiveStents)
        tvUpcoming = findViewById(R.id.tvUpcoming)
        tvOverdue = findViewById(R.id.tvOverdue)
        progressBar = findViewById(R.id.progressBar)
        rvUpcoming = findViewById(R.id.rvUpcoming)

        rvUpcoming.layoutManager = LinearLayoutManager(this)

        val userName = DJStentCareApp.instance.getUserName() ?: "Doctor"
        tvWelcome.text = "Welcome back,\nDr. $userName"

        // 🔔 Notification icon
        findViewById<ImageView>(R.id.ivNotification).setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }
    }

    private fun setupBottomNav() {
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNav)
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home     -> true
                R.id.nav_patients -> {
                    startActivity(Intent(this, MyPatientsActivity::class.java))
                    true
                }
                R.id.nav_schedule -> {
                    startActivity(Intent(this, CalendarActivity::class.java))
                    true
                }
                R.id.nav_profile -> {
                    startActivity(Intent(this, DoctorProfileActivity::class.java))
                    true
                }
                else -> false
            }
        }
    }

    private fun setupQuickActions() {
        findViewById<MaterialCardView>(R.id.cardAddPatient).setOnClickListener {
            startActivity(Intent(this, AddPatientActivity::class.java))
        }

        findViewById<MaterialCardView>(R.id.cardAddStent).setOnClickListener {
            startActivity(Intent(this, MyPatientsActivity::class.java).apply {
                putExtra("action", "add_stent")
            })
        }

        findViewById<TextView>(R.id.tvViewAll).setOnClickListener {
            startActivity(Intent(this, CalendarActivity::class.java))
        }
    }

    private fun loadDashboard() {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                // Fetch basic dashboard data (like upcoming removals for the list)
                val response = ApiClient.apiService.getDoctorDashboard()
                
                // Fetch ALL patients to calculate stats dynamically as requested
                val patientsResponse = ApiClient.apiService.getPatients()

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    if (data != null) {
                        // Calculate stats dynamically from patients list if possible
                        if (patientsResponse.isSuccessful && patientsResponse.body()?.success == true) {
                            val patients = patientsResponse.body()?.data?.patients ?: emptyList()
                            
                            val totalPatients = patients.size
                            val activeStents = patients.count { it.stentStatus?.lowercase() == "active" }
                            val upcoming = patients.count { 
                                it.daysLeft != null && it.daysLeft in 0..7 && it.stentStatus?.lowercase() != "removed"
                            }
                            val overdue = patients.count { 
                                it.daysLeft != null && it.daysLeft < 0 && it.stentStatus?.lowercase() != "removed"
                            }

                            tvTotalPatients.text = totalPatients.toString()
                            tvActiveStents.text = activeStents.toString()
                            tvUpcoming.text = upcoming.toString()
                            tvOverdue.text = overdue.toString()
                        } else {
                            // Fallback to API provided stats if patient list fails
                            tvTotalPatients.text = data.stats.totalPatients.toString()
                            tvActiveStents.text = data.stats.activeStents.toString()
                            tvUpcoming.text = data.stats.upcomingRemovals.toString()
                            tvOverdue.text = data.stats.overdueStents.toString()
                        }

                        val adapter = UpcomingRemovalAdapter(data.upcomingRemovals) { removal ->
                            val intent = Intent(this@DoctorDashboardActivity, PatientDetailsActivity::class.java)
                            intent.putExtra("patient_id", removal.patientDbId)
                            startActivity(intent)
                        }
                        rvUpcoming.adapter = adapter
                    }
                } else {
                    Toast.makeText(this@DoctorDashboardActivity,
                        "Failed to load dashboard", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@DoctorDashboardActivity,
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
