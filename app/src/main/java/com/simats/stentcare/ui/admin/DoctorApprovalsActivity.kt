package com.simats.stentcare.ui.admin

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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
import com.simats.stentcare.models.ApproveDoctorRequest
import com.simats.stentcare.models.PendingDoctor
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.launch

class DoctorApprovalsActivity : AppCompatActivity() {

    private lateinit var rvDoctors: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_doctor_approvals)
        
        initViews()
        loadPendingDoctors()
    }

    private fun initViews() {
        rvDoctors = findViewById(R.id.rvDoctors)
        progressBar = findViewById(R.id.progressBar)
        tvEmpty = findViewById(R.id.tvEmpty)
        
        rvDoctors.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
    }

    private fun loadPendingDoctors() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getPendingDoctors()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val doctors = response.body()?.data?.doctors ?: emptyList()
                    
                    if (doctors.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                        rvDoctors.visibility = View.GONE
                    } else {
                        tvEmpty.visibility = View.GONE
                        rvDoctors.visibility = View.VISIBLE
                        rvDoctors.adapter = PendingDoctorAdapter(doctors) { doctor, action ->
                            handleDoctorAction(doctor, action)
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@DoctorApprovalsActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
    
    private fun handleDoctorAction(doctor: PendingDoctor, action: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.approveDoctor(
                    ApproveDoctorRequest(doctor.id, action)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@DoctorApprovalsActivity, 
                        "Doctor ${if (action == "approve") "approved" else "rejected"}", 
                        Toast.LENGTH_SHORT).show()
                    loadPendingDoctors()
                } else {
                    Toast.makeText(this@DoctorApprovalsActivity, 
                        response.body()?.message ?: "Action failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@DoctorApprovalsActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

class PendingDoctorAdapter(
    private val doctors: List<PendingDoctor>,
    private val onAction: (PendingDoctor, String) -> Unit
) : RecyclerView.Adapter<PendingDoctorAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_pending_doctor, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(doctors[position])
    }

    override fun getItemCount() = doctors.size

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tvDoctorName)
        private val tvEmail: TextView = itemView.findViewById(R.id.tvEmail)
        private val tvHospital: TextView = itemView.findViewById(R.id.tvHospital)
        private val btnApprove: MaterialButton = itemView.findViewById(R.id.btnApprove)
        private val btnReject: MaterialButton = itemView.findViewById(R.id.btnReject)

        fun bind(doctor: PendingDoctor) {
            tvName.text = doctor.fullName
            tvEmail.text = doctor.email
            tvHospital.text = doctor.hospitalName ?: "No Hospital"
            
            btnApprove.setOnClickListener { onAction(doctor, "approve") }
            btnReject.setOnClickListener { onAction(doctor, "reject") }
        }
    }
}
