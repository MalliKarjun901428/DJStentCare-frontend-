package com.simats.stentcare.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.ForgotPasswordRequest
import com.simats.stentcare.models.ResetPasswordRequest
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import kotlinx.coroutines.launch

class ForgotPasswordActivity : AppCompatActivity() {

    private lateinit var etEmail: TextInputEditText
    private lateinit var etOtp: TextInputEditText
    private lateinit var etNewPassword: TextInputEditText
    private lateinit var etConfirmPassword: TextInputEditText
    private lateinit var layoutOtp: TextInputLayout
    private lateinit var layoutNewPassword: TextInputLayout
    private lateinit var layoutConfirmPassword: TextInputLayout
    private lateinit var btnSubmit: MaterialButton
    private lateinit var progressBar: ProgressBar

    private var step = 1  // 1 = email, 2 = otp + new password
    private var userEmail = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_forgot_password)

        initViews()
    }

    private fun initViews() {
        etEmail = findViewById(R.id.etEmail)
        etOtp = findViewById(R.id.etOtp)
        etNewPassword = findViewById(R.id.etNewPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        layoutOtp = findViewById(R.id.layoutOtp)
        layoutNewPassword = findViewById(R.id.layoutNewPassword)
        layoutConfirmPassword = findViewById(R.id.layoutConfirmPassword)
        btnSubmit = findViewById(R.id.btnSubmit)
        progressBar = findViewById(R.id.progressBar)

        // Initially hide OTP and password fields
        layoutOtp.visibility = View.GONE
        layoutNewPassword.visibility = View.GONE
        layoutConfirmPassword.visibility = View.GONE

        findViewById<View>(R.id.btnBack).setOnClickListener {
            finish()
        }

        btnSubmit.setOnClickListener {
            if (step == 1) requestOtp() else resetPassword()
        }
    }

    private fun requestOtp() {
        val email = etEmail.text.toString().trim()

        if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.error = "Valid email is required"
            return
        }

        userEmail = email
        progressBar.visibility = View.VISIBLE
        btnSubmit.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.forgotPassword(ForgotPasswordRequest(email.lowercase()))

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    val debugOtp = data?.debugOtp

                    // Show the OTP prominently if email not configured
                    if (debugOtp != null && !(data.emailSent)) {
                        // Auto-fill the OTP field so user doesn't have to type it
                        etOtp.setText(debugOtp)
                        Toast.makeText(
                            this@ForgotPasswordActivity,
                            "⚠ Test OTP: $debugOtp",
                            Toast.LENGTH_LONG
                        ).show()
                    } else {
                        Toast.makeText(
                            this@ForgotPasswordActivity,
                            "OTP sent to your email",
                            Toast.LENGTH_SHORT
                        ).show()
                    }

                    // Reveal OTP + password fields, move to step 2
                    step = 2
                    layoutOtp.visibility = View.VISIBLE
                    layoutNewPassword.visibility = View.VISIBLE
                    layoutConfirmPassword.visibility = View.VISIBLE
                    btnSubmit.text = "Reset Password"
                    etEmail.isEnabled = false
                } else {
                    Toast.makeText(
                        this@ForgotPasswordActivity,
                        response.body()?.message ?: "Email not found",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@ForgotPasswordActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                progressBar.visibility = View.GONE
                btnSubmit.isEnabled = true
            }
        }
    }

    private fun resetPassword() {
        val otp = etOtp.text.toString().trim()
        val newPassword = etNewPassword.text.toString()
        val confirmPassword = etConfirmPassword.text.toString()

        if (otp.isEmpty()) {
            etOtp.error = "OTP is required"
            return
        }

        if (newPassword.length < 6) {
            etNewPassword.error = "Password must be at least 6 characters"
            return
        }

        if (newPassword != confirmPassword) {
            etConfirmPassword.error = "Passwords don't match"
            return
        }

        progressBar.visibility = View.VISIBLE
        btnSubmit.isEnabled = false

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.resetPassword(
                    ResetPasswordRequest(userEmail, otp, newPassword)
                )

                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(
                        this@ForgotPasswordActivity,
                        "Password reset! Please login with your new password.",
                        Toast.LENGTH_LONG
                    ).show()

                    val intent = Intent(this@ForgotPasswordActivity, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(
                        this@ForgotPasswordActivity,
                        response.body()?.message ?: "Password reset failed",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@ForgotPasswordActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                progressBar.visibility = View.GONE
                btnSubmit.isEnabled = true
            }
        }
    }
}
