package com.simats.stentcare.ui.doctor

import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.UpdateStentRequest
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class StentDetailsActivity : AppCompatActivity() {

    private lateinit var tvStentId: TextView
    private lateinit var tvPatientName: TextView
    private lateinit var tvInsertDate: TextView
    private lateinit var tvRemovalDate: TextView
    private lateinit var tvStatus: TextView
    private lateinit var tvDaysLeft: TextView
    private lateinit var tvStentType: TextView
    private lateinit var tvSide: TextView
    private lateinit var tvNotes: TextView
    private lateinit var progressBar: ProgressBar
    
    private var stentId: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_stent_details)
        
        stentId = intent.getIntExtra("stent_id", 0)
        
        initViews()
        loadStentDetails()
    }

    private fun initViews() {
        tvStentId = findViewById(R.id.tvStentId)
        tvPatientName = findViewById(R.id.tvPatientName)
        tvInsertDate = findViewById(R.id.tvInsertDate)
        tvRemovalDate = findViewById(R.id.tvRemovalDate)
        tvStatus = findViewById(R.id.tvStatus)
        tvDaysLeft = findViewById(R.id.tvDaysLeft)
        tvStentType = findViewById(R.id.tvStentType)
        tvSide = findViewById(R.id.tvSide)
        tvNotes = findViewById(R.id.tvNotes)
        progressBar = findViewById(R.id.progressBar)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        findViewById<android.widget.Button>(R.id.btnMarkRemoved).setOnClickListener {
            showMarkRemovedDialog()
        }
    }

    private fun loadStentDetails() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getStentDetails(stentId)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val stent = response.body()?.data
                    
                    if (stent != null) {
                        tvStentId.text = stent.stentId
                        tvPatientName.text = stent.patientName ?: "-"
                        tvInsertDate.text = stent.insertionDate
                        tvRemovalDate.text = stent.expectedRemovalDate
                        tvStatus.text = stent.status.replaceFirstChar(Char::uppercaseChar)
                        tvStentType.text = stent.stentType ?: "Standard"
                        tvSide.text = stent.side ?: "-"
                        tvNotes.text = stent.notes ?: "No notes"
                        
                        val daysLeft = stent.daysLeft
                        if (daysLeft != null && stent.status == "active") {
                            when {
                                daysLeft < 0 -> {
                                    tvDaysLeft.text = "${-daysLeft} days overdue"
                                    tvDaysLeft.setTextColor(getColor(R.color.error))
                                }
                                daysLeft == 0 -> {
                                    tvDaysLeft.text = "Due today"
                                    tvDaysLeft.setTextColor(getColor(R.color.warning))
                                }
                                else -> {
                                    tvDaysLeft.text = "$daysLeft days left"
                                    tvDaysLeft.setTextColor(getColor(R.color.success))
                                }
                            }
                        } else {
                            tvDaysLeft.text = if (stent.status == "removed") "Removed" else "-"
                            tvDaysLeft.setTextColor(getColor(R.color.text_hint))
                        }
                        
                        // Hide mark removed button if already removed
                        if (stent.status == "removed") {
                            findViewById<android.widget.Button>(R.id.btnMarkRemoved).visibility = View.GONE
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@StentDetailsActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
    
    private fun showMarkRemovedDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Mark Stent Removed")
            .setMessage("Are you sure you want to mark this stent as removed?")
            .setPositiveButton("Yes, Remove") { _, _ ->
                markStentRemoved()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun markStentRemoved() {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.updateStent(
                    UpdateStentRequest(id = stentId, status = "removed")
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@StentDetailsActivity, 
                        "Stent marked as removed", Toast.LENGTH_SHORT).show()
                    finish()
                }
            } catch (e: Exception) {
                Toast.makeText(this@StentDetailsActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
