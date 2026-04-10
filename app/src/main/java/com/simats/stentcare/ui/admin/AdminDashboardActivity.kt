package com.simats.stentcare.ui.admin

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.ui.auth.RoleSelectionActivity
import com.simats.stentcare.ui.common.NotificationsActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.card.MaterialCardView
import kotlinx.coroutines.launch

class AdminDashboardActivity : AppCompatActivity() {

    private lateinit var tvTotalDoctors: TextView
    private lateinit var tvTotalPatients: TextView
    private lateinit var tvActiveStents: TextView
    private lateinit var tvHospitals: TextView
    private lateinit var tvPendingCount: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_dashboard)
        
        initViews()
        setupBottomNav()
        setupCards()
        loadDashboard()
    }

    private fun initViews() {
        tvTotalDoctors = findViewById(R.id.tvTotalDoctors)
        tvTotalPatients = findViewById(R.id.tvTotalPatients)
        tvActiveStents = findViewById(R.id.tvActiveStents)
        tvHospitals = findViewById(R.id.tvHospitals)
        tvPendingCount = findViewById(R.id.tvPendingCount)
        progressBar = findViewById(R.id.progressBar)
    }

    private fun setupBottomNav() {
        val bottomNav = findViewById<BottomNavigationView>(R.id.bottomNav)
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> true
                R.id.nav_users -> {
                    startActivity(Intent(this, UserManagementActivity::class.java))
                    true
                }
                R.id.nav_hospitals -> {
                    startActivity(Intent(this, HospitalManagementActivity::class.java))
                    true
                }
                R.id.nav_settings -> {
                    startActivity(Intent(this, AdminSettingsActivity::class.java))
                    true
                }
                else -> false
            }
        }
    }
    
    private fun setupCards() {
        findViewById<MaterialCardView>(R.id.cardTotalDoctors).setOnClickListener {
            startActivity(Intent(this, UserManagementActivity::class.java).apply {
                putExtra("role", "doctor")
            })
        }
        
        findViewById<MaterialCardView>(R.id.cardTotalPatientsAdmin).setOnClickListener {
            startActivity(Intent(this, UserManagementActivity::class.java).apply {
                putExtra("role", "patient")
            })
        }
        
        findViewById<MaterialCardView>(R.id.cardActiveStentsAdmin).setOnClickListener {
            startActivity(Intent(this, UserManagementActivity::class.java).apply {
                putExtra("role", "patient")
            })
        }
        
        findViewById<MaterialCardView>(R.id.cardHospitalsStats).setOnClickListener {
            startActivity(Intent(this, HospitalManagementActivity::class.java))
        }
        
        findViewById<MaterialCardView>(R.id.cardApprovals).setOnClickListener {
            startActivity(Intent(this, DoctorApprovalsActivity::class.java))
        }
        
        findViewById<MaterialCardView>(R.id.cardUsers).setOnClickListener {
            startActivity(Intent(this, UserManagementActivity::class.java))
        }
        
        findViewById<MaterialCardView>(R.id.cardHospitals).setOnClickListener {
            startActivity(Intent(this, HospitalManagementActivity::class.java))
        }
        
        findViewById<TextView>(R.id.tvLogout).setOnClickListener {
            DJStentCareApp.instance.logout()
            val intent = Intent(this, RoleSelectionActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
        }
    }

    private fun loadDashboard() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getAdminDashboard()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    
                    if (data != null) {
                        tvTotalDoctors.text = data.stats.totalDoctors.toString()
                        tvTotalPatients.text = data.stats.totalPatients.toString()
                        tvActiveStents.text = data.stats.activeStents.toString()
                        tvHospitals.text = data.stats.totalHospitals.toString()
                        tvPendingCount.text = "${data.stats.pendingApprovals} pending"
                    }
                } else {
                    Toast.makeText(this@AdminDashboardActivity, 
                        "Failed to load dashboard", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminDashboardActivity, 
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
