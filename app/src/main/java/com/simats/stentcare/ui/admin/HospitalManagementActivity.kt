package com.simats.stentcare.ui.admin

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import android.text.InputFilter
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.Hospital
import com.simats.stentcare.models.HospitalActionRequest
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.launch

class HospitalManagementActivity : AppCompatActivity() {

    private lateinit var rvHospitals: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView
    private lateinit var fabAdd: FloatingActionButton

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_hospital_management)
        
        initViews()
        loadHospitals()
    }

    private fun initViews() {
        rvHospitals = findViewById(R.id.rvHospitals)
        progressBar = findViewById(R.id.progressBar)
        tvEmpty = findViewById(R.id.tvEmpty)
        fabAdd = findViewById(R.id.fabAddHospital)
        
        rvHospitals.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        fabAdd.setOnClickListener {
            showAddHospitalDialog()
        }
    }

    private fun loadHospitals() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getHospitals()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val hospitals = response.body()?.data?.hospitals ?: emptyList()
                    
                    if (hospitals.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                        rvHospitals.visibility = View.GONE
                    } else {
                        tvEmpty.visibility = View.GONE
                        rvHospitals.visibility = View.VISIBLE
                        rvHospitals.adapter = HospitalAdapter(hospitals) { hospital ->
                            showEditHospitalDialog(hospital)
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@HospitalManagementActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
    
    private fun showAddHospitalDialog() {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_hospital, null)
        val etName = dialogView.findViewById<EditText>(R.id.etName)
        val etAddress = dialogView.findViewById<EditText>(R.id.etAddress)
        val etPhone = dialogView.findViewById<EditText>(R.id.etPhone)
        
        etPhone.filters = arrayOf(InputFilter.LengthFilter(10))
        
        AlertDialog.Builder(this)
            .setTitle("Add Hospital")
            .setView(dialogView)
            .setPositiveButton("Add") { _, _ ->
                val name = etName.text.toString().trim()
                val address = etAddress.text.toString().trim()
                val phone = etPhone.text.toString().trim()
                
                if (name.isNotEmpty()) {
                    addHospital(name, address, phone)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun showEditHospitalDialog(hospital: Hospital) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_hospital, null)
        val etName = dialogView.findViewById<EditText>(R.id.etName)
        val etAddress = dialogView.findViewById<EditText>(R.id.etAddress)
        val etPhone = dialogView.findViewById<EditText>(R.id.etPhone)
        
        etPhone.filters = arrayOf(InputFilter.LengthFilter(10))
        
        etName.setText(hospital.name)
        etAddress.setText(hospital.address)
        etPhone.setText(hospital.phone)
        
        AlertDialog.Builder(this)
            .setTitle("Edit Hospital")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val name = etName.text.toString().trim()
                val address = etAddress.text.toString().trim()
                val phone = etPhone.text.toString().trim()
                
                if (name.isNotEmpty()) {
                    updateHospital(hospital.id, name, address, phone)
                }
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun addHospital(name: String, address: String, phone: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.hospitalAction(
                    HospitalActionRequest("add", null, name, address, phone)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@HospitalManagementActivity, 
                        "Hospital added", Toast.LENGTH_SHORT).show()
                    loadHospitals()
                } else {
                    Toast.makeText(this@HospitalManagementActivity, 
                        response.body()?.message ?: "Failed to add", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@HospitalManagementActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun updateHospital(id: Int, name: String, address: String, phone: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.hospitalAction(
                    HospitalActionRequest("update", id, name, address, phone)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@HospitalManagementActivity, 
                        "Hospital updated", Toast.LENGTH_SHORT).show()
                    loadHospitals()
                } else {
                    Toast.makeText(this@HospitalManagementActivity, 
                        response.body()?.message ?: "Failed to update", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@HospitalManagementActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

class HospitalAdapter(
    private val hospitals: List<Hospital>,
    private val onClick: (Hospital) -> Unit
) : RecyclerView.Adapter<HospitalAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_hospital, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(hospitals[position])
    }

    override fun getItemCount() = hospitals.size

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tvName)
        private val tvAddress: TextView = itemView.findViewById(R.id.tvAddress)
        private val tvDoctorCount: TextView = itemView.findViewById(R.id.tvDoctorCount)

        fun bind(hospital: Hospital) {
            tvName.text = hospital.name
            tvAddress.text = hospital.address ?: "No address"
            tvDoctorCount.text = "${hospital.doctorCount ?: 0} Doctors"
            
            itemView.setOnClickListener { onClick(hospital) }
        }
    }
}
