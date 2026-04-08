package com.simats.stentcare.ui.patient

import android.os.Bundle
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.LogHydrationRequest
import com.google.android.material.progressindicator.CircularProgressIndicator
import kotlinx.coroutines.launch

class HydrationTrackerActivity : AppCompatActivity() {

    private lateinit var tvGlasses: TextView
    private lateinit var tvGoal: TextView
    private lateinit var progressBar: CircularProgressIndicator
    private lateinit var tvPercent: TextView
    private lateinit var tvStreak: TextView
    private lateinit var tvAvgWeek: TextView
    
    private var currentGlasses = 0
    private var dailyGoal = 8

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_hydration_tracker)
        
        initViews()
        loadHydrationStats()
    }

    private fun initViews() {
        tvGlasses = findViewById(R.id.tvGlasses)
        tvGoal = findViewById(R.id.tvGoal)
        progressBar = findViewById(R.id.progressHydration)
        tvPercent = findViewById(R.id.tvPercent)
        tvStreak = findViewById(R.id.tvStreak)
        tvAvgWeek = findViewById(R.id.tvAvgWeek)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        findViewById<ImageButton>(R.id.btnAddWater).setOnClickListener {
            logWater(1)
        }
        
        findViewById<ImageButton>(R.id.btnRemoveWater).setOnClickListener {
            logWater(-1)
        }
    }

    private fun loadHydrationStats() {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getHydrationStats()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    
                    if (data != null) {
                        currentGlasses = data.today.glasses
                        dailyGoal = data.today.dailyGoal
                        
                        updateUI()
                        
                        tvStreak.text = "${data.stats.dayStreak} days"
                        tvAvgWeek.text = "${data.stats.avgPercent}%"
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@HydrationTrackerActivity, 
                    "Error loading stats", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun logWater(amount: Int) {
        val action = if (amount > 0) "add" else "remove"
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.logHydration(
                    LogHydrationRequest(action, kotlin.math.abs(amount))
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    currentGlasses = response.body()?.data?.glasses ?: currentGlasses
                    updateUI()
                }
            } catch (e: Exception) {
                Toast.makeText(this@HydrationTrackerActivity, 
                    "Error logging water", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateUI() {
        tvGlasses.text = currentGlasses.toString()
        tvGoal.text = "/ $dailyGoal glasses"
        
        val percent = ((currentGlasses.toFloat() / dailyGoal) * 100).toInt().coerceIn(0, 100)
        progressBar.progress = percent
        tvPercent.text = "$percent%"
    }
}
