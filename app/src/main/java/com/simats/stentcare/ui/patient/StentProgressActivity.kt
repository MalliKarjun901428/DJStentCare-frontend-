package com.simats.stentcare.ui.patient

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
import com.google.android.material.progressindicator.CircularProgressIndicator
import kotlinx.coroutines.launch

class StentProgressActivity : AppCompatActivity() {

    private lateinit var tvStentId: TextView
    private lateinit var tvDaysLeft: TextView
    private lateinit var tvInsertDate: TextView
    private lateinit var tvRemovalDate: TextView
    private lateinit var tvStatus: TextView
    private lateinit var progressCircle: CircularProgressIndicator
    private lateinit var tvProgressPercent: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_stent_progress)
        
        initViews()
        loadStentProgress()
    }

    private fun initViews() {
        tvStentId = findViewById(R.id.tvStentId)
        tvDaysLeft = findViewById(R.id.tvDaysLeft)
        tvInsertDate = findViewById(R.id.tvInsertDate)
        tvRemovalDate = findViewById(R.id.tvRemovalDate)
        tvStatus = findViewById(R.id.tvStatus)
        progressCircle = findViewById(R.id.progressCircle)
        tvProgressPercent = findViewById(R.id.tvProgressPercent)
        progressBar = findViewById(R.id.progressBar)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
    }

    private fun loadStentProgress() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getPatientDashboard()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val stent = response.body()?.data?.activeStent
                    
                    if (stent != null) {
                        tvStentId.text = stent.stentId
                        tvInsertDate.text = stent.insertionDate
                        tvRemovalDate.text = stent.expectedRemovalDate
                        
                        val progress = stent.progressPercent
                        progressCircle.progress = progress
                        tvProgressPercent.text = "$progress%"
                        
                        val daysLeft = stent.daysLeft
                        when {
                            daysLeft < 0 -> {
                                tvDaysLeft.text = "${-daysLeft} days overdue"
                                tvDaysLeft.setTextColor(getColor(R.color.error))
                                tvStatus.text = "OVERDUE"
                                tvStatus.setTextColor(getColor(R.color.error))
                            }
                            daysLeft == 0 -> {
                                tvDaysLeft.text = "Due today"
                                tvDaysLeft.setTextColor(getColor(R.color.warning))
                                tvStatus.text = "DUE TODAY"
                                tvStatus.setTextColor(getColor(R.color.warning))
                            }
                            daysLeft <= 7 -> {
                                tvDaysLeft.text = "$daysLeft days left"
                                tvDaysLeft.setTextColor(getColor(R.color.warning))
                                tvStatus.text = "UPCOMING"
                                tvStatus.setTextColor(getColor(R.color.warning))
                            }
                            else -> {
                                tvDaysLeft.text = "$daysLeft days left"
                                tvDaysLeft.setTextColor(getColor(R.color.success))
                                tvStatus.text = "ACTIVE"
                                tvStatus.setTextColor(getColor(R.color.success))
                            }
                        }
                    } else {
                        tvStentId.text = "No active stent"
                        tvStatus.text = "NO STENT"
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@StentProgressActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
}
