package com.simats.stentcare.ui.auth

import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.text.Editable
import android.text.InputFilter
import android.text.TextWatcher
import android.view.View
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.RegisterRequest
import com.google.android.material.button.MaterialButton
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.textfield.TextInputEditText
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.io.ByteArrayOutputStream
import java.util.UUID

class SignupActivity : AppCompatActivity() {

    private lateinit var etFullName: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var etPhone: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var etConfirmPassword: TextInputEditText
    private lateinit var spinnerGender: AutoCompleteTextView
    private lateinit var etAge: TextInputEditText
    private lateinit var layoutPhone: com.google.android.material.textfield.TextInputLayout
    private lateinit var layoutAge: com.google.android.material.textfield.TextInputLayout
    private lateinit var etSpecialization: TextInputEditText
    private lateinit var btnSignup: MaterialButton
    private lateinit var progressBar: ProgressBar
    private lateinit var ivProfile: ImageView
    private lateinit var btnSelectImage: FloatingActionButton
    private lateinit var tvImageError: TextView

    private var role: String = "patient"
    private var selectedImageUri: Uri? = null

    private val selectImageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let {
            selectedImageUri = it
            ivProfile.setImageURI(it)
            tvImageError.visibility = View.GONE
            validateForm()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        role = intent.getStringExtra("role") ?: "patient"

        initViews()
        setupGenderDropdown()
    }

    private fun initViews() {
        etFullName = findViewById(R.id.etFullName)
        etEmail = findViewById(R.id.etEmail)
        etPhone = findViewById(R.id.etPhone)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        spinnerGender = findViewById(R.id.spinnerGender)
        etAge = findViewById(R.id.etAge)
        etSpecialization = findViewById(R.id.etSpecialization)
        btnSignup = findViewById(R.id.btnSignup)
        progressBar = findViewById(R.id.progressBar)
        layoutPhone = findViewById(R.id.layoutPhone)
        layoutAge = findViewById(R.id.layoutAge)
        
        // Set numeric input and length filters
        etPhone.filters = arrayOf(InputFilter.LengthFilter(10))
        etAge.filters = arrayOf(InputFilter.LengthFilter(2))
        
        btnSelectImage.setOnClickListener {
            selectImageLauncher.launch("image/*")
        }

        setupTextWatchers()
        validateForm() // Initial check

        // Show/hide fields based on role
        val specializationLayout = findViewById<View>(R.id.layoutSpecialization)
        if (role == "doctor") {
            specializationLayout.visibility = View.VISIBLE
        } else {
            specializationLayout.visibility = View.GONE
        }

        findViewById<View>(R.id.btnBack).setOnClickListener {
            finish()
        }

        findViewById<View>(R.id.tvLogin).setOnClickListener {
            finish()
        }

        btnSignup.setOnClickListener {
            validateAndSignup()
        }
    }

    private fun setupTextWatchers() {
        val watcher = object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validateForm()
            }
        }

        etFullName.addTextChangedListener(watcher)
        etEmail.addTextChangedListener(watcher)
        etPhone.addTextChangedListener(watcher)
        etAge.addTextChangedListener(watcher)
        etPassword.addTextChangedListener(watcher)
        etConfirmPassword.addTextChangedListener(watcher)
    }

    private fun validateForm() {
        val fullName = etFullName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val phone = etPhone.text.toString().trim()
        val age = etAge.text.toString().trim()

        // Real-time hints for length-limited fields
        if (phone.isNotEmpty() && phone.length < 10) {
            layoutPhone.error = "Must be 10 digits"
        } else {
            layoutPhone.error = null
        }

        if (age.isNotEmpty() && (age.toIntOrNull() ?: 100) > 99) {
            layoutAge.error = "Max 99"
        } else {
            layoutAge.error = null
        }

        // We keep the button ENABLED so the user can click it and see what's missing
        btnSignup.isEnabled = true 
    }


    private fun setupGenderDropdown() {
        val genders = arrayOf("Male", "Female", "Other")
        val adapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, genders)
        spinnerGender.setAdapter(adapter)
    }

    private fun validateAndSignup() {
        val fullName = etFullName.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val phone = etPhone.text.toString().trim()
        val password = etPassword.text.toString()
        val confirmPassword = etConfirmPassword.text.toString()
        val gender = spinnerGender.text.toString()
        val age = etAge.text.toString().toIntOrNull() ?: 0
        val specialization = etSpecialization.text.toString().trim()

        if (fullName.isEmpty()) {
            etFullName.error = "Name is required"
            return
        }

        if (email.isEmpty() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.error = "Valid email is required"
            return
        }

        if (phone.isEmpty() || phone.length != 10) {
            etPhone.error = "Exactly 10 digits required"
            return
        }

        if (age == 0 || age > 99) {
            etAge.error = "Valid age (1-99) required"
            return
        }

        if (selectedImageUri == null) {
            tvImageError.visibility = View.VISIBLE
            Toast.makeText(this, "Please select a profile image", Toast.LENGTH_SHORT).show()
            return
        }

        if (password.length < 6) {
            etPassword.error = "Password must be at least 6 characters"
            return
        }

        if (password != confirmPassword) {
            etConfirmPassword.error = "Passwords don't match"
            return
        }

        if (role == "doctor" && specialization.isEmpty()) {
            etSpecialization.error = "Specialization is required for doctors"
            return
        }

        uploadImageAndSignup(fullName, email, phone, password, gender, age, specialization)
    }

    private fun uploadImageAndSignup(
        fullName: String,
        email: String,
        phone: String,
        password: String,
        gender: String,
        age: Int,
        specialization: String
    ) {
        progressBar.visibility = View.VISIBLE
        btnSignup.isEnabled = false

        lifecycleScope.launch {
            try {
                val imageUrl = uploadToFirebase()
                if (imageUrl != null) {
                    performSignup(fullName, email, phone, password, gender, age, specialization, imageUrl)
                } else {
                    Toast.makeText(this@SignupActivity, "Failed to upload image", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                // FALLBACK: Use a placeholder if Firebase fails (missing config)
                val fallbackUrl = "https://ui-avatars.com/api/?name=$fullName"
                performSignup(fullName, email, phone, password, gender, age, specialization, fallbackUrl)
            } finally {
                progressBar.visibility = View.GONE
                btnSignup.isEnabled = true
            }
        }
    }

    private suspend fun uploadToFirebase(): String? {
        val uri = selectedImageUri ?: return null
        val fileName = UUID.randomUUID().toString() + ".jpg"
        
        return try {
            val storage = FirebaseStorage.getInstance()
            val ref = storage.reference.child("profiles/$fileName")
            ref.putFile(uri).await()
            ref.downloadUrl.await().toString()
        } catch (e: Exception) {
            // Log and return null to trigger fallback
            null
        }
    }

    private fun performSignup(
        fullName: String,
        email: String,
        phone: String,
        password: String,
        gender: String,
        age: Int,
        specialization: String,
        profileImageUrl: String
    ) {
        lifecycleScope.launch {
            try {
                val request = RegisterRequest(
                    role = role,
                    email = email.lowercase(),
                    password = password,
                    fullName = fullName,
                    phone = phone,
                    specialization = if (role == "doctor") specialization else null,
                    age = age,
                    gender = gender.lowercase(),
                    profileImage = profileImageUrl
                )

                val response = ApiClient.apiService.register(request)

                if (response.isSuccessful && response.body()?.success == true) {
                    val userId = response.body()?.data?.userId ?: -1
                    
                    // ⚡ Store in Firebase Database as requested
                    if (userId != -1) {
                        try {
                            com.google.firebase.database.FirebaseDatabase.getInstance().getReference("users")
                                .child(userId.toString())
                                .child("profile_image")
                                .setValue(profileImageUrl)
                        } catch (e: Exception) {
                            // Firebase not initialized
                        }
                    }

                    Toast.makeText(
                        this@SignupActivity,
                        "OTP sent to your email: $email",
                        Toast.LENGTH_SHORT
                    ).show()

                    val intent = Intent(this@SignupActivity, OtpVerificationActivity::class.java)
                    intent.putExtra("email", email)
                    intent.putExtra("role", role)
                    startActivity(intent)
                    finish()
                } else {
                    Toast.makeText(
                        this@SignupActivity,
                        response.body()?.message ?: "Registration failed",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@SignupActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            } finally {
                progressBar.visibility = View.GONE
                btnSignup.isEnabled = true
            }
        }
    }
}
