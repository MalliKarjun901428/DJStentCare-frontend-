package com.simats.stentcare.ui.splash

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.ui.onboarding.OnboardingActivity
import com.simats.stentcare.ui.auth.RoleSelectionActivity
import com.simats.stentcare.ui.doctor.DoctorDashboardActivity
import com.simats.stentcare.ui.patient.PatientDashboardActivity
import com.simats.stentcare.ui.admin.AdminDashboardActivity

@SuppressLint("CustomSplashScreen")
class SplashActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)
        
        Handler(Looper.getMainLooper()).postDelayed({
            navigateToNext()
        }, 2000)
    }
    
    private fun navigateToNext() {
        val app = DJStentCareApp.instance
        
        val intent = when {
            !app.hasSeenOnboarding() -> {
                Intent(this, OnboardingActivity::class.java)
            }
            !app.isLoggedIn() -> {
                Intent(this, RoleSelectionActivity::class.java)
            }
            else -> {
                when (app.getUserRole()) {
                    "doctor" -> Intent(this, DoctorDashboardActivity::class.java)
                    "patient" -> Intent(this, PatientDashboardActivity::class.java)
                    "admin" -> Intent(this, AdminDashboardActivity::class.java)
                    else -> Intent(this, RoleSelectionActivity::class.java)
                }
            }
        }
        
        startActivity(intent)
        finish()
    }
}
