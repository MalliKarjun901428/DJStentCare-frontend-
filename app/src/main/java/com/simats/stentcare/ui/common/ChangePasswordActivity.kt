package com.simats.stentcare.ui.common

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.ChangePasswordRequest
import kotlinx.coroutines.launch

class ChangePasswordActivity : AppCompatActivity() {

    private lateinit var etCurrentPassword: TextInputEditText
    private lateinit var etNewPassword: TextInputEditText
    private lateinit var etConfirmPassword: TextInputEditText
    private lateinit var btnUpdate: MaterialButton
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_password)

        initViews()
    }

    private fun initViews() {
        etCurrentPassword = findViewById(R.id.etCurrentPassword)
        etNewPassword = findViewById(R.id.etNewPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnUpdate = findViewById(R.id.btnUpdatePassword)
        progressBar = findViewById(R.id.progressBar)

        findViewById<View>(R.id.btnBack).setOnClickListener {
            finish()
        }

        btnUpdate.setOnClickListener {
            validateAndSubmit()
        }
    }

    private fun validateAndSubmit() {
        val currentPass = etCurrentPassword.text.toString()
        val newPass = etNewPassword.text.toString()
        val confirmPass = etConfirmPassword.text.toString()

        if (currentPass.isEmpty()) {
            etCurrentPassword.error = "Current password required"
            return
        }

        if (newPass.length < 8) {
            etNewPassword.error = "Password must be at least 8 characters"
            return
        }

        if (newPass != confirmPass) {
            etConfirmPassword.error = "Passwords do not match"
            return
        }

        performPasswordChange(currentPass, newPass)
    }

    private fun performPasswordChange(currentPass: String, newPass: String) {
        setLoading(true)
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.changePassword(
                    ChangePasswordRequest(currentPass, newPass)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@ChangePasswordActivity, 
                        "Password updated successfully", Toast.LENGTH_LONG).show()
                    finish()
                } else {
                    val errorMsg = response.body()?.message ?: "Failed to update password"
                    Toast.makeText(this@ChangePasswordActivity, errorMsg, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChangePasswordActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        btnUpdate.isEnabled = !loading
        progressBar.visibility = if (loading) View.VISIBLE else View.GONE
    }
}
