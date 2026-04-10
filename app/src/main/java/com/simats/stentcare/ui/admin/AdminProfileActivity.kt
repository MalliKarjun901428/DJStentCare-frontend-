package com.simats.stentcare.ui.admin

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.UpdateProfileRequest
import de.hdodenhof.circleimageview.CircleImageView
import kotlinx.coroutines.launch

class AdminProfileActivity : AppCompatActivity() {

    private lateinit var etFullName: TextInputEditText
    private lateinit var etPhone: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var ivProfileImage: CircleImageView
    private lateinit var btnUpdate: MaterialButton
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_profile)

        initViews()
        loadProfileData()
    }

    private fun initViews() {
        etFullName = findViewById(R.id.etFullName)
        etPhone = findViewById(R.id.etPhone)
        etEmail = findViewById(R.id.etEmail)
        ivProfileImage = findViewById(R.id.ivProfileImage)
        btnUpdate = findViewById(R.id.btnUpdateProfile)
        progressBar = findViewById(R.id.progressBar)

        findViewById<View>(R.id.btnBack).setOnClickListener {
            finish()
        }

        btnUpdate.setOnClickListener {
            validateAndSubmit()
        }
    }

    private fun loadProfileData() {
        setLoading(true)
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getAdminProfile()
                if (response.isSuccessful && response.body()?.success == true) {
                    val user = response.body()?.data
                    user?.let {
                        etFullName.setText(it.fullName)
                        etPhone.setText(it.phone ?: "")
                        etEmail.setText(it.email)
                        
                        if (!it.profileImage.isNullOrEmpty()) {
                            Glide.with(this@AdminProfileActivity)
                                .load(it.profileImage)
                                .placeholder(R.drawable.ic_profile_placeholder)
                                .into(ivProfileImage)
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminProfileActivity, "Error loading profile", Toast.LENGTH_SHORT).show()
            } finally {
                setLoading(false)
            }
        }
    }

    private fun validateAndSubmit() {
        val fullName = etFullName.text.toString().trim()
        val phone = etPhone.text.toString().trim()

        if (fullName.isEmpty()) {
            etFullName.error = "Name required"
            return
        }

        if (phone.isNotEmpty() && phone.length != 10) {
            etPhone.error = "Phone must be 10 digits"
            return
        }

        updateProfile(fullName, phone)
    }

    private fun updateProfile(fullName: String, phone: String) {
        setLoading(true)
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.updateAdminProfile(
                    UpdateProfileRequest(fullName, phone)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@AdminProfileActivity, "Profile updated", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this@AdminProfileActivity, "Update failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AdminProfileActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
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
