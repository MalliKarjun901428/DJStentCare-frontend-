package com.simats.stentcare.ui.doctor

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.Patient
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class MyPatientsActivity : AppCompatActivity() {

    private lateinit var rvPatients: RecyclerView
    private lateinit var etSearch: EditText
    private lateinit var progressBar: ProgressBar
    private lateinit var fabAdd: FloatingActionButton
    
    private var patients = listOf<Patient>()
    private var searchJob: Job? = null
    private var statusFilter: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_my_patients)
        
        statusFilter = intent.getStringExtra("status")
        
        initViews()
        loadPatients()
    }

    private fun initViews() {
        rvPatients = findViewById(R.id.rvPatients)
        etSearch = findViewById(R.id.etSearch)
        progressBar = findViewById(R.id.progressBar)
        fabAdd = findViewById(R.id.fabAddPatient)
        
        rvPatients.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        // Show filter status if set
        if (!statusFilter.isNullOrEmpty()) {
            val title = when(statusFilter) {
                "active" -> "Active Stents"
                "upcoming" -> "Upcoming Removals"
                "overdue" -> "Overdue Removals"
                else -> "My Patients"
            }
            findViewById<android.widget.TextView>(R.id.tvTitle)?.text = title
        }
        
        fabAdd.setOnClickListener {
            startActivity(Intent(this, AddPatientActivity::class.java))
        }
        
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                searchJob?.cancel()
                searchJob = lifecycleScope.launch {
                    delay(300)
                    loadPatients(s.toString())
                }
            }
        })
    }

    private fun loadPatients(search: String? = null) {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getPatients(search, statusFilter)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    
                    if (data != null) {
                        patients = data.patients
                        rvPatients.adapter = PatientAdapter(patients) { patient ->
                            val intent = Intent(this@MyPatientsActivity, PatientDetailsActivity::class.java)
                            intent.putExtra("patient_id", patient.id)
                            startActivity(intent)
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@MyPatientsActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        loadPatients()
    }
}

class PatientAdapter(
    private val patients: List<Patient>,
    private val onClick: (Patient) -> Unit
) : RecyclerView.Adapter<PatientAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_patient, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(patients[position])
    }

    override fun getItemCount() = patients.size

    inner class ViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: android.widget.TextView = itemView.findViewById(R.id.tvPatientName)
        private val tvId: android.widget.TextView = itemView.findViewById(R.id.tvPatientId)
        private val tvStatus: android.widget.TextView = itemView.findViewById(R.id.tvStatus)
        private val tvDays: android.widget.TextView = itemView.findViewById(R.id.tvDaysLeft)

        fun bind(patient: Patient) {
            tvName.text = patient.fullName
            tvId.text = patient.patientId ?: "ID: ${patient.id}"
            tvStatus.text = patient.displayStatus ?: patient.stentStatus ?: "No Stent"
            
            val daysLeft = patient.daysLeft
            if (daysLeft != null) {
                when {
                    daysLeft < 0 -> {
                        tvDays.text = "${-daysLeft}d overdue"
                        tvDays.setTextColor(itemView.context.getColor(R.color.error))
                    }
                    daysLeft <= 7 -> {
                        tvDays.text = "${daysLeft}d left"
                        tvDays.setTextColor(itemView.context.getColor(R.color.warning))
                    }
                    else -> {
                        tvDays.text = "${daysLeft}d left"
                        tvDays.setTextColor(itemView.context.getColor(R.color.success))
                    }
                }
            } else {
                tvDays.text = ""
            }
            
            itemView.setOnClickListener { onClick(patient) }
        }
    }
}
