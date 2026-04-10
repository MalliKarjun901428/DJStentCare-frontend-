package com.simats.stentcare.ui.patient

import android.app.AlertDialog
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.util.Base64
import android.view.LayoutInflater
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.ChangePasswordRequest
import com.simats.stentcare.models.UpdateProfileRequest
import com.simats.stentcare.ui.auth.RoleSelectionActivity
import com.simats.stentcare.ui.common.AboutActivity
import com.simats.stentcare.ui.common.HelpSupportActivity
import com.simats.stentcare.ui.common.NotificationsActivity
import com.google.android.material.card.MaterialCardView
import com.google.android.material.textfield.TextInputEditText
import com.bumptech.glide.Glide
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.io.ByteArrayOutputStream
import java.util.UUID

class PatientProfileActivity : AppCompatActivity() {

    private lateinit var tvName: TextView
    private lateinit var tvPatientId: TextView
    private lateinit var tvAge: TextView
    private lateinit var tvPhone: TextView
    private lateinit var tvDoctorName: TextView
    private lateinit var ivProfileImage: ImageView

    // Gallery image picker
    private val imagePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { uploadProfileImage(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_patient_profile)
        initViews()
        loadProfile()
    }

    private fun initViews() {
        tvName       = findViewById(R.id.tvName)
        tvPatientId  = findViewById(R.id.tvPatientId)
        tvAge        = findViewById(R.id.tvAge)
        tvPhone      = findViewById(R.id.tvPhone)
        tvDoctorName = findViewById(R.id.tvDoctorName)
        ivProfileImage = findViewById(R.id.ivProfileImage)

        // Tap profile image to change it
        ivProfileImage.setOnClickListener {
            imagePickerLauncher.launch("image/*")
        }

        findViewById<ImageButton>(R.id.btnBack).setOnClickListener { finish() }

        findViewById<MaterialCardView>(R.id.cardNotifications).setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardHelp).setOnClickListener {
            startActivity(Intent(this, HelpSupportActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardAbout).setOnClickListener {
            startActivity(Intent(this, AboutActivity::class.java))
        }
        findViewById<MaterialCardView>(R.id.cardLogout).setOnClickListener { logout() }

        // Edit Profile (null-safe)
        findViewById<MaterialCardView?>(R.id.cardEditProfile)?.setOnClickListener {
            showEditProfileDialog()
        }
        // Change Password (null-safe)
        findViewById<MaterialCardView?>(R.id.cardChangePassword)?.setOnClickListener {
            showChangePasswordDialog()
        }
    }

    private fun loadProfile() {
        tvName.text = DJStentCareApp.instance.getUserName() ?: "Patient"

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getPatientProfile()
                if (response.isSuccessful && response.body()?.success == true) {
                    val p = response.body()?.data ?: return@launch
                    tvName.text       = p.fullName
                    tvPatientId.text  = p.patientId
                    tvAge.text        = if (p.age != null) "${p.age} years" else "-"
                    tvPhone.text      = p.phone ?: "-"
                    tvDoctorName.text = if (p.doctorName != null) "Dr. ${p.doctorName}" else "Not assigned"

                    // Load profile image if available
                    if (!p.profileImage.isNullOrBlank()) {
                        Glide.with(this@PatientProfileActivity)
                            .load(p.profileImage)
                            .placeholder(R.drawable.ic_profile_placeholder)
                            .into(ivProfileImage)
                    }

                    DJStentCareApp.instance.saveUserSession(
                        token  = DJStentCareApp.instance.getAuthToken() ?: "",
                        userId = DJStentCareApp.instance.getUserId(),
                        role   = DJStentCareApp.instance.getUserRole() ?: "patient",
                        name   = p.fullName
                    )
                }
            } catch (_: Exception) {}
        }
    }

    private fun loadBase64Image(base64: String) {
        // Obsolete
    }

    private fun uploadProfileImage(uri: Uri) {
        lifecycleScope.launch {
            try {
                Toast.makeText(this@PatientProfileActivity, "Uploading...", Toast.LENGTH_SHORT).show()
                val fileName = UUID.randomUUID().toString() + ".jpg"
                val storage = FirebaseStorage.getInstance()
                val ref = storage.reference.child("profiles/$fileName")
                
                ref.putFile(uri).await()
                val imageUrl = ref.downloadUrl.await().toString()

                val response = ApiClient.apiService.updatePatientProfile(
                    UpdateProfileRequest(
                        fullName = tvName.text.toString(),
                        phone = tvPhone.text.toString(),
                        profileImage = imageUrl
                    )
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    Glide.with(this@PatientProfileActivity)
                        .load(imageUrl)
                        .into(ivProfileImage)
                    Toast.makeText(this@PatientProfileActivity, "Profile photo updated!", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this@PatientProfileActivity, "Failed to update profile", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@PatientProfileActivity, "Upload error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showEditProfileDialog() {
        val view = LayoutInflater.from(this).inflate(R.layout.dialog_edit_profile, null)
        val etName  = view.findViewById<TextInputEditText>(R.id.etName)
        val etPhone = view.findViewById<TextInputEditText>(R.id.etPhone)
        val layoutName  = view.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.layoutName)
        val layoutPhone = view.findViewById<com.google.android.material.textfield.TextInputLayout>(R.id.layoutPhone)

        etName.setText(tvName.text.toString())
        etPhone.setText(tvPhone.text.toString())
        
        // Apply length filter
        etPhone.filters = arrayOf(android.text.InputFilter.LengthFilter(10))

        val dialog = AlertDialog.Builder(this)
            .setTitle("Edit Profile")
            .setView(view)
            .setPositiveButton("Save", null) // Set to null first to override default closing behavior
            .setNegativeButton("Cancel", null)
            .create()

        dialog.show()

        // Override positive button to prevent closing on invalid input
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
            val newName  = etName.text.toString().trim()
            val newPhone = etPhone.text.toString().trim()
            
            var isValid = true
            
            if (newName.isEmpty()) {
                layoutName.error = "Name required"
                isValid = false
            } else {
                layoutName.error = null
            }
            
            if (newPhone.length != 10) {
                layoutPhone.error = "Must be 10 digits"
                isValid = false
            } else {
                layoutPhone.error = null
            }
            
            if (isValid) {
                updateProfile(newName, newPhone)
                dialog.dismiss()
            }
        }
    }

    private fun updateProfile(name: String, phone: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.updatePatientProfile(
                    UpdateProfileRequest(fullName = name, phone = phone)
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@PatientProfileActivity, "Profile updated!", Toast.LENGTH_SHORT).show()
                    DJStentCareApp.instance.saveUserSession(
                        token  = DJStentCareApp.instance.getAuthToken() ?: "",
                        userId = DJStentCareApp.instance.getUserId(),
                        role   = DJStentCareApp.instance.getUserRole() ?: "patient",
                        name   = name
                    )
                    loadProfile()
                } else {
                    val errMsg = try {
                        org.json.JSONObject(response.errorBody()?.string() ?: "{}").optString("message", "Update failed")
                    } catch (_: Exception) { "Update failed" }
                    Toast.makeText(this@PatientProfileActivity, errMsg, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@PatientProfileActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showChangePasswordDialog() {
        val view      = LayoutInflater.from(this).inflate(R.layout.dialog_change_password, null)
        val etOld     = view.findViewById<TextInputEditText>(R.id.etCurrentPassword)
        val etNew     = view.findViewById<TextInputEditText>(R.id.etNewPassword)
        val etConfirm = view.findViewById<TextInputEditText>(R.id.etConfirmPassword)

        AlertDialog.Builder(this)
            .setTitle("Change Password")
            .setView(view)
            .setPositiveButton("Change") { _, _ ->
                val old     = etOld.text.toString()
                val newPwd  = etNew.text.toString()
                val confirm = etConfirm.text.toString()
                when {
                    old.isEmpty()     -> Toast.makeText(this, "Current password required", Toast.LENGTH_SHORT).show()
                    newPwd.length < 6 -> Toast.makeText(this, "Min 6 characters", Toast.LENGTH_SHORT).show()
                    newPwd != confirm  -> Toast.makeText(this, "Passwords don't match", Toast.LENGTH_SHORT).show()
                    else -> changePassword(old, newPwd)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun changePassword(oldPwd: String, newPwd: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.changePassword(
                    ChangePasswordRequest(currentPassword = oldPwd, newPassword = newPwd)
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@PatientProfileActivity, "Password changed!", Toast.LENGTH_SHORT).show()
                } else {
                    val errMsg = try {
                        org.json.JSONObject(response.errorBody()?.string() ?: "{}").optString("message", "Failed to change password")
                    } catch (_: Exception) { "Failed to change password" }
                    Toast.makeText(this@PatientProfileActivity, errMsg, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@PatientProfileActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun logout() {
        DJStentCareApp.instance.logout()
        val intent = Intent(this, RoleSelectionActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
