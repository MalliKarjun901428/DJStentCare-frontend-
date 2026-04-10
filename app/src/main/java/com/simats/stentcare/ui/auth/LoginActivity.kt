package com.simats.stentcare.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.LoginRequest
import com.simats.stentcare.ui.doctor.DoctorDashboardActivity
import com.simats.stentcare.ui.patient.PatientDashboardActivity
import com.simats.stentcare.ui.admin.AdminDashboardActivity
import kotlinx.coroutines.launch
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {
    
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private var selectedRole: String = "patient"
    private var allowSignup: Boolean = true
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        selectedRole = intent.getStringExtra("role") ?: "patient"
        allowSignup = intent.getBooleanExtra("allow_signup", true)
        
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        
        val tvTitle = findViewById<TextView>(R.id.tvTitle)
        tvTitle.text = when (selectedRole) {
            "doctor" -> "Doctor Login"
            "admin" -> "Admin Login"
            else -> "Patient Login"
        }
        
        btnLogin.setOnClickListener {
            login()
        }
        
        findViewById<View>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        findViewById<TextView>(R.id.tvForgotPassword).setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }
        
        // Hide signup section for admin
        val tvSignUp = findViewById<TextView>(R.id.tvSignUp)
        val signupContainer = findViewById<LinearLayout>(R.id.signupContainer)
        
        if (allowSignup) {
            signupContainer?.visibility = View.VISIBLE
            tvSignUp.setOnClickListener {
                val intent = Intent(this, SignupActivity::class.java).apply {
                    putExtra("role", selectedRole)
                }
                startActivity(intent)
            }
        } else {
            signupContainer?.visibility = View.GONE
        }
    }
    
    private fun login() {
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString()
        
        if (email.isEmpty()) {
            etEmail.error = "Email required"
            return
        }
        
        if (password.isEmpty()) {
            etPassword.error = "Password required"
            return
        }
        
        btnLogin.isEnabled = false
        btnLogin.text = "Logging in..."
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.login(LoginRequest(email.lowercase(), password, selectedRole))
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    
                    if (data != null) {
                        // Save session
                        DJStentCareApp.instance.saveUserSession(
                            token = data.token,
                            userId = data.user.id,
                            role = data.user.role,
                            name = data.user.fullName
                        )
                        
                        // Navigate to appropriate dashboard
                        val intent = when (data.user.role) {
                            "doctor" -> Intent(this@LoginActivity, DoctorDashboardActivity::class.java)
                            "patient" -> Intent(this@LoginActivity, PatientDashboardActivity::class.java)
                            "admin" -> Intent(this@LoginActivity, AdminDashboardActivity::class.java)
                            else -> Intent(this@LoginActivity, PatientDashboardActivity::class.java)
                        }
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    }
                } else if (response.code() == 403) {
                    // Account not verified or doctor not approved
                    // Backend returns JSON: { "success": false, "message": "...", "debug_otp": "xxx", "email": "..." }
                    val rawBody = response.errorBody()?.string() ?: ""
                    val debugOtp = try {
                        val json = JSONObject(rawBody)
                        json.optString("debug_otp", "")
                    } catch (e: Exception) { "" }

                    // If debug_otp is present → unverified account → go to OTP screen
                    if (debugOtp.isNotEmpty()) {
                        Toast.makeText(this@LoginActivity,
                            "Account not verified. OTP sent — please verify.",
                            Toast.LENGTH_LONG).show()
                        val intent = Intent(this@LoginActivity, OtpVerificationActivity::class.java)
                        intent.putExtra("email", email)
                        intent.putExtra("role", selectedRole)
                        intent.putExtra("debug_otp", debugOtp)
                        startActivity(intent)
                    } else {
                        // Doctor pending approval
                        Toast.makeText(this@LoginActivity,
                            "Your account is pending admin approval.",
                            Toast.LENGTH_LONG).show()
                    }
                } else {
                    val errorMessage = response.body()?.message
                        ?: response.errorBody()?.string()?.let {
                            try { JSONObject(it).optString("message", "Login failed") }
                            catch (e: Exception) { "Login failed" }
                        } ?: "Login failed"
                    Toast.makeText(this@LoginActivity, errorMessage, Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, "Connection error: ${e.message}", Toast.LENGTH_LONG).show()
            } finally {
                btnLogin.isEnabled = true
                btnLogin.text = "Login"
            }
        }
    }
}
