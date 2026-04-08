package com.simats.stentcare.ui.doctor

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.PatientDetails
import com.simats.stentcare.models.Stent
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.launch

class PatientDetailsActivity : AppCompatActivity() {

    private lateinit var tvName: TextView
    private lateinit var tvPatientId: TextView
    private lateinit var tvAge: TextView
    private lateinit var tvGender: TextView
    private lateinit var tvPhone: TextView
    private lateinit var tvEmail: TextView
    private lateinit var rvStents: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var fabAddStent: FloatingActionButton
    
    private var patientId: Int = 0
    private var patientProfileId: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_patient_details)
        
        patientId = intent.getIntExtra("patient_id", 0)
        
        initViews()
        loadPatientDetails()
    }

    private fun initViews() {
        tvName = findViewById(R.id.tvName)
        tvPatientId = findViewById(R.id.tvPatientId)
        tvAge = findViewById(R.id.tvAge)
        tvGender = findViewById(R.id.tvGender)
        tvPhone = findViewById(R.id.tvPhone)
        tvEmail = findViewById(R.id.tvEmail)
        rvStents = findViewById(R.id.rvStents)
        progressBar = findViewById(R.id.progressBar)
        fabAddStent = findViewById(R.id.fabAddStent)
        
        rvStents.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        fabAddStent.setOnClickListener {
            val intent = Intent(this, AddStentActivity::class.java)
            intent.putExtra("patient_id", patientProfileId)
            startActivity(intent)
        }
    }

    private fun loadPatientDetails() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getPatientDetails(patientId)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    
                    if (data != null) {
                        displayPatientInfo(data)
                    }
                } else {
                    Toast.makeText(this@PatientDetailsActivity, 
                        "Failed to load patient details", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@PatientDetailsActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
    
    private fun displayPatientInfo(data: PatientDetails) {
        val patient = data.patient
        patientProfileId = patient.id
        
        tvName.text = patient.fullName
        tvPatientId.text = patient.patientId ?: "ID: ${patient.id}"
        tvAge.text = "${patient.age ?: "-"} years"
        tvGender.text = patient.gender ?: "-"
        tvPhone.text = patient.phone ?: "-"
        tvEmail.text = patient.email ?: "-"
        
        rvStents.adapter = StentAdapter(data.stents) { stent ->
            val intent = Intent(this, StentDetailsActivity::class.java)
            intent.putExtra("stent_id", stent.id)
            startActivity(intent)
        }
    }
    
    override fun onResume() {
        super.onResume()
        if (patientId > 0) loadPatientDetails()
    }
}

class StentAdapter(
    private val stents: List<Stent>,
    private val onClick: (Stent) -> Unit
) : RecyclerView.Adapter<StentAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_stent, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(stents[position])
    }

    override fun getItemCount() = stents.size

    inner class ViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        private val tvStentId: TextView = itemView.findViewById(R.id.tvStentId)
        private val tvDates: TextView = itemView.findViewById(R.id.tvDates)
        private val tvStatus: TextView = itemView.findViewById(R.id.tvStatus)
        private val tvDaysLeft: TextView = itemView.findViewById(R.id.tvDaysLeft)

        fun bind(stent: Stent) {
            tvStentId.text = stent.stentId
            tvDates.text = "${stent.insertionDate} → ${stent.expectedRemovalDate}"
            tvStatus.text = stent.status.replaceFirstChar(Char::uppercaseChar)
            
            val daysLeft = stent.daysLeft
            if (daysLeft != null && stent.status == "active") {
                when {
                    daysLeft < 0 -> {
                        tvDaysLeft.text = "${-daysLeft}d overdue"
                        tvDaysLeft.setTextColor(itemView.context.getColor(R.color.error))
                        tvStatus.setTextColor(itemView.context.getColor(R.color.error))
                    }
                    daysLeft <= 7 -> {
                        tvDaysLeft.text = "${daysLeft}d left"
                        tvDaysLeft.setTextColor(itemView.context.getColor(R.color.warning))
                    }
                    else -> {
                        tvDaysLeft.text = "${daysLeft}d left"
                        tvDaysLeft.setTextColor(itemView.context.getColor(R.color.success))
                    }
                }
            } else {
                tvDaysLeft.text = ""
                tvStatus.setTextColor(itemView.context.getColor(R.color.text_hint))
            }
            
            itemView.setOnClickListener { onClick(stent) }
        }
    }
}
