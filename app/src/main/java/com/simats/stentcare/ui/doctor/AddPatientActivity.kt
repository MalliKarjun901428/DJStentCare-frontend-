package com.simats.stentcare.ui.doctor

import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.AddPatientRequest
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch

class AddPatientActivity : AppCompatActivity() {

    private lateinit var etName: TextInputEditText
    private lateinit var etAge: TextInputEditText
    private lateinit var etPhone: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var etEmergencyContact: TextInputEditText
    private lateinit var layoutPhone: com.google.android.material.textfield.TextInputLayout
    private lateinit var layoutAge: com.google.android.material.textfield.TextInputLayout
    private lateinit var btnSave: Button
    
    private var selectedGender = "Male"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_patient)
        
        initViews()
    }

    private fun initViews() {
        etName = findViewById(R.id.etName)
        etAge = findViewById(R.id.etAge)
        etPhone = findViewById(R.id.etPhone)
        etEmail = findViewById(R.id.etEmail)
        etEmergencyContact = findViewById(R.id.etEmergencyContact)
        layoutPhone = findViewById(R.id.layoutPhone)
        layoutAge = findViewById(R.id.layoutAge)
        btnSave = findViewById(R.id.btnSave)

        // Set length filters
        etPhone.filters = arrayOf(android.text.InputFilter.LengthFilter(10))
        etAge.filters = arrayOf(android.text.InputFilter.LengthFilter(2))
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        // Gender chips
        val chipMale = findViewById<com.google.android.material.chip.Chip>(R.id.chipMale)
        val chipFemale = findViewById<com.google.android.material.chip.Chip>(R.id.chipFemale)
        
        chipMale.setOnClickListener {
            selectedGender = "Male"
            chipMale.isChecked = true
            chipFemale.isChecked = false
        }
        
        chipFemale.setOnClickListener {
            selectedGender = "Female"
            chipFemale.isChecked = true
            chipMale.isChecked = false
        }
        
        btnSave.setOnClickListener {
            savePatient()
        }
    }

    private fun savePatient() {
        val name = etName.text.toString().trim()
        val ageStr = etAge.text.toString().trim()
        val phone = etPhone.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val emergency = etEmergencyContact.text.toString().trim()
        
        var isValid = true

        if (name.isEmpty()) {
            etName.error = "Name required"
            isValid = false
        }
        
        if (ageStr.isEmpty()) {
            etAge.error = "Age required"
            isValid = false
        } else if (ageStr.toIntOrNull() == null || ageStr.toInt() > 99) {
            layoutAge.error = "Invalid age (0-99)"
            isValid = false
        } else {
            layoutAge.error = null
        }
        
        if (phone.isEmpty() || phone.length != 10) {
            layoutPhone.error = "Exactly 10 digits required"
            isValid = false
        } else {
            layoutPhone.error = null
        }

        if (!isValid) return
        
        btnSave.isEnabled = false
        btnSave.text = "Saving..."
        
        lifecycleScope.launch {
            try {
                val request = AddPatientRequest(
                    fullName = name,
                    age = ageStr.toInt(),
                    gender = selectedGender,
                    phone = phone,
                    email = email.ifEmpty { null },
                    emergencyContact = emergency.ifEmpty { null }
                )
                
                val response = ApiClient.apiService.addPatient(request)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    val msg = if (data?.isExisting == true) {
                        "✓ Patient linked! Dr. assignment sent to ${data.fullName}. They will see a notification."
                    } else {
                        "✓ Patient added! ID: ${data?.patientId}\nTemp password: patient123"
                    }
                    Toast.makeText(this@AddPatientActivity, msg, Toast.LENGTH_LONG).show()
                    finish()
                } else {
                    // For 4xx errors Retrofit returns null body() — read errorBody instead
                    val errorMsg = response.body()?.message
                        ?: try {
                            val errJson = org.json.JSONObject(response.errorBody()?.string() ?: "{}")
                            errJson.optString("message", "Failed to add patient")
                        } catch (e: Exception) { "Failed to add patient (${response.code()})" }
                    Toast.makeText(this@AddPatientActivity, errorMsg, Toast.LENGTH_LONG).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AddPatientActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                btnSave.isEnabled = true
                btnSave.text = "Add Patient"
            }
        }
    }
}
