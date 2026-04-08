package com.simats.stentcare.ui.doctor

import android.app.DatePickerDialog
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.AddStentRequest
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class AddStentActivity : AppCompatActivity() {

    private lateinit var etInsertDate: TextInputEditText
    private lateinit var etRemovalDate: TextInputEditText
    private lateinit var etStentType: TextInputEditText
    private lateinit var etSide: TextInputEditText
    private lateinit var etNotes: TextInputEditText
    private lateinit var btnSave: Button
    
    private var patientId: Int = 0
    private val calendar = Calendar.getInstance()
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_stent)
        
        patientId = intent.getIntExtra("patient_id", 0)
        
        initViews()
        setupDatePickers()
    }

    private fun initViews() {
        etInsertDate = findViewById(R.id.etInsertDate)
        etRemovalDate = findViewById(R.id.etRemovalDate)
        etStentType = findViewById(R.id.etStentType)
        etSide = findViewById(R.id.etSide)
        etNotes = findViewById(R.id.etNotes)
        btnSave = findViewById(R.id.btnSave)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        btnSave.setOnClickListener {
            saveStent()
        }
        
        // Default dates
        etInsertDate.setText(dateFormat.format(calendar.time))
        calendar.add(Calendar.DAY_OF_MONTH, 30) // Default 30 days
        etRemovalDate.setText(dateFormat.format(calendar.time))
    }
    
    private fun setupDatePickers() {
        etInsertDate.setOnClickListener {
            showDatePicker { date ->
                etInsertDate.setText(date)
            }
        }
        
        etRemovalDate.setOnClickListener {
            showDatePicker { date ->
                etRemovalDate.setText(date)
            }
        }
    }
    
    private fun showDatePicker(onDateSelected: (String) -> Unit) {
        val dialog = DatePickerDialog(
            this,
            { _, year, month, day ->
                calendar.set(year, month, day)
                onDateSelected(dateFormat.format(calendar.time))
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )
        dialog.show()
    }

    private fun saveStent() {
        val insertDate = etInsertDate.text.toString()
        val removalDate = etRemovalDate.text.toString()
        
        if (insertDate.isEmpty() || removalDate.isEmpty()) {
            Toast.makeText(this, "Please select both dates", Toast.LENGTH_SHORT).show()
            return
        }
        
        btnSave.isEnabled = false
        btnSave.text = "Saving..."
        
        lifecycleScope.launch {
            try {
                val request = AddStentRequest(
                    patientId = patientId,
                    insertionDate = insertDate,
                    expectedRemovalDate = removalDate,
                    stentType = etStentType.text.toString().ifEmpty { null },
                    side = etSide.text.toString().ifEmpty { null },
                    notes = etNotes.text.toString().ifEmpty { null }
                )
                
                val response = ApiClient.apiService.addStent(request)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val stentId = response.body()?.data?.stentId
                    Toast.makeText(this@AddStentActivity, 
                        "Stent added! ID: $stentId", Toast.LENGTH_LONG).show()
                    finish()
                } else {
                    Toast.makeText(this@AddStentActivity, 
                        response.body()?.message ?: "Failed to add stent", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@AddStentActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                btnSave.isEnabled = true
                btnSave.text = "Add DJ Stent"
            }
        }
    }
}
