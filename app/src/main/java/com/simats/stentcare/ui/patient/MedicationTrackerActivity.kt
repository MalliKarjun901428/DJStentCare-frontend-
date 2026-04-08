package com.simats.stentcare.ui.patient

import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.Medication
import com.simats.stentcare.models.MedicationActionRequest
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch

class MedicationTrackerActivity : AppCompatActivity() {

    private lateinit var rvMedications: RecyclerView
    private lateinit var tvAdherence: TextView
    private lateinit var tvActiveCount: TextView
    private var medications = mutableListOf<Medication>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_medication_tracker)
        
        initViews()
        loadMedications()
    }

    private fun initViews() {
        rvMedications = findViewById(R.id.rvMedications)
        tvAdherence = findViewById(R.id.tvAdherence)
        tvActiveCount = findViewById(R.id.tvActiveCount)
        
        rvMedications.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        findViewById<Button>(R.id.btnAddMedication).setOnClickListener {
            showAddMedicationDialog()
        }
    }

    private fun loadMedications() {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getMedications()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    
                    if (data != null) {
                        medications = data.medications.toMutableList()
                        tvAdherence.text = "${data.adherenceRate}%"
                        tvActiveCount.text = "${data.activeCount}"
                        
                        rvMedications.adapter = MedicationAdapter(medications) { med, action ->
                            takeMedication(med.id, action)
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@MedicationTrackerActivity, 
                    "Error loading medications", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun takeMedication(medicationId: Int, action: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.medicationAction(
                    MedicationActionRequest(action = action, medicationId = medicationId)
                )
                
                if (response.isSuccessful) {
                    Toast.makeText(this@MedicationTrackerActivity, 
                        "Medication $action!", Toast.LENGTH_SHORT).show()
                    loadMedications()
                }
            } catch (e: Exception) {
                Toast.makeText(this@MedicationTrackerActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun showAddMedicationDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_add_medication, null)
        
        MaterialAlertDialogBuilder(this)
            .setTitle("Add Medication")
            .setView(dialogView)
            .setPositiveButton("Add") { _, _ ->
                val name = dialogView.findViewById<TextInputEditText>(R.id.etMedName).text.toString()
                val dosage = dialogView.findViewById<TextInputEditText>(R.id.etDosage).text.toString()
                val frequency = dialogView.findViewById<TextInputEditText>(R.id.etFrequency).text.toString()
                
                if (name.isNotEmpty()) {
                    addMedication(name, dosage, frequency)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun addMedication(name: String, dosage: String, frequency: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.medicationAction(
                    MedicationActionRequest(
                        action = "add",
                        name = name,
                        dosage = dosage,
                        frequency = frequency
                    )
                )
                
                if (response.isSuccessful) {
                    Toast.makeText(this@MedicationTrackerActivity, 
                        "Medication added!", Toast.LENGTH_SHORT).show()
                    loadMedications()
                }
            } catch (e: Exception) {
                Toast.makeText(this@MedicationTrackerActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

// Simple adapter for medications
class MedicationAdapter(
    private val medications: List<Medication>,
    private val onAction: (Medication, String) -> Unit
) : RecyclerView.Adapter<MedicationAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_medication, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(medications[position])
    }

    override fun getItemCount() = medications.size

    inner class ViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tvMedName)
        private val tvDosage: TextView = itemView.findViewById(R.id.tvDosage)
        private val btnTake: Button = itemView.findViewById(R.id.btnTake)

        fun bind(medication: Medication) {
            tvName.text = medication.name
            tvDosage.text = "${medication.dosage} - ${medication.frequency}"
            
            btnTake.setOnClickListener {
                onAction(medication, "take")
            }
        }
    }
}
