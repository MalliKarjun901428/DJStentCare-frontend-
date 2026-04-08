package com.simats.stentcare.ui.auth

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.OtpRequest
import com.simats.stentcare.ui.admin.AdminDashboardActivity
import com.simats.stentcare.ui.doctor.DoctorDashboardActivity
import com.simats.stentcare.ui.patient.PatientDashboardActivity
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.launch

class OtpVerificationActivity : AppCompatActivity() {

    private lateinit var etOtp1: EditText
    private lateinit var etOtp2: EditText
    private lateinit var etOtp3: EditText
    private lateinit var etOtp4: EditText
    private lateinit var etOtp5: EditText
    private lateinit var etOtp6: EditText
    private lateinit var btnVerify: MaterialButton
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmail: TextView

    private var email: String = ""
    private var role: String = "patient"
    private var debugOtp: String = ""  // Passed from SignupActivity or login 403

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_otp_verification)

        email = intent.getStringExtra("email") ?: ""
        role = intent.getStringExtra("role") ?: "patient"
        debugOtp = intent.getStringExtra("debug_otp") ?: ""

        initViews()
        setupOtpInputs()

        // Auto-fill and show OTP banner if email is not configured
        if (debugOtp.isNotEmpty()) {
            showDebugOtpBanner()
            autoFillOtp(debugOtp)
        }
    }

    private fun initViews() {
        etOtp1 = findViewById(R.id.etOtp1)
        etOtp2 = findViewById(R.id.etOtp2)
        etOtp3 = findViewById(R.id.etOtp3)
        etOtp4 = findViewById(R.id.etOtp4)
        etOtp5 = findViewById(R.id.etOtp5)
        etOtp6 = findViewById(R.id.etOtp6)
        btnVerify = findViewById(R.id.btnVerify)
        progressBar = findViewById(R.id.progressBar)
        tvEmail = findViewById(R.id.tvEmail)

        tvEmail.text = "Code sent to $email"

        findViewById<View>(R.id.btnBack).setOnClickListener {
            finish()
        }

        findViewById<View>(R.id.tvResend).setOnClickListener {
            resendOtp()
        }

        btnVerify.setOnClickListener {
            verifyOtp()
        }
    }

    /**
     * Shows a prominent Toast with the debug OTP for easy copy-paste
     * when email is not configured.
     */
    private fun showDebugOtpBanner() {
        Toast.makeText(
            this,
            "⚠ Test OTP: $debugOtp\n(Fields auto-filled for you)",
            Toast.LENGTH_LONG
        ).show()
    }

    /**
     * Auto-fills all 6 OTP digit fields from a 6-character string
     */
    private fun autoFillOtp(otp: String) {
        val otpFields = listOf(etOtp1, etOtp2, etOtp3, etOtp4, etOtp5, etOtp6)
        otp.forEachIndexed { index, char ->
            if (index < otpFields.size) {
                otpFields[index].setText(char.toString())
            }
        }
    }

    private fun setupOtpInputs() {
        val otpFields = listOf(etOtp1, etOtp2, etOtp3, etOtp4, etOtp5, etOtp6)

        otpFields.forEachIndexed { index, editText ->
            editText.addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
                override fun afterTextChanged(s: Editable?) {
                    if (s?.length == 1 && index < otpFields.size - 1) {
                        otpFields[index + 1].requestFocus()
                    }
                }
            })

            editText.setOnKeyListener { _, keyCode, _ ->
                if (keyCode == android.view.KeyEvent.KEYCODE_DEL &&
                    editText.text.isEmpty() && index > 0) {
                    otpFields[index - 1].requestFocus()
                    otpFields[index - 1].setText("")
                }
                false
            }
        }

        etOtp1.requestFocus()
    }

    private fun resendOtp() {
        if (email.isEmpty()) return

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.forgotPassword(
                    com.simats.stentcare.models.ForgotPasswordRequest(email)
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@OtpVerificationActivity,
                        "OTP resent!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@OtpVerificationActivity,
                        "Failed to resend OTP", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@OtpVerificationActivity,
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun verifyOtp() {
        val otp = "${etOtp1.text}${etOtp2.text}${etOtp3.text}${etOtp4.text}${etOtp5.text}${etOtp6.text}"

        if (otp.length != 6) {
            Toast.makeText(this, "Please enter complete OTP", Toast.LENGTH_SHORT).show()
            return
        }

        progressBar.visibility = View.VISIBLE
        btnVerify.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.verifyOtp(OtpRequest(email, otp))

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data

                    if (data?.token != null) {
                        DJStentCareApp.instance.saveAuth(data.token, data.role, 0)

                        val intent = when (data.role) {
                            "doctor" -> Intent(this@OtpVerificationActivity, DoctorDashboardActivity::class.java)
                            "admin"  -> Intent(this@OtpVerificationActivity, AdminDashboardActivity::class.java)
                            else     -> Intent(this@OtpVerificationActivity, PatientDashboardActivity::class.java)
                        }
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@OtpVerificationActivity,
                            "Verification successful! Please login.", Toast.LENGTH_LONG).show()
                        val intent = Intent(this@OtpVerificationActivity, LoginActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    }
                } else {
                    val body = response.body()
                    // If debug_otp came back in error (e.g. wrong OTP entered), try to show it
                    Toast.makeText(this@OtpVerificationActivity,
                        body?.message ?: "Invalid OTP", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@OtpVerificationActivity,
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
                btnVerify.isEnabled = true
            }
        }
    }
}
