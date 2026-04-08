package com.simats.stentcare.ui.patient

import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.SeekBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.LogSymptomsRequest
import com.google.android.material.chip.Chip
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch

class SymptomTrackerActivity : AppCompatActivity() {

    private lateinit var seekPain: SeekBar
    private lateinit var tvPainLevel: TextView
    private lateinit var seekWater: SeekBar
    private lateinit var tvWaterLevel: TextView
    private lateinit var chipBloodYes: Chip
    private lateinit var chipBloodNo: Chip
    private lateinit var chipFrequentYes: Chip
    private lateinit var chipFrequentNo: Chip
    private lateinit var etNotes: TextInputEditText
    private lateinit var btnSave: Button
    
    private var bloodInUrine = 0
    private var frequentUrination = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_symptom_tracker)
        
        initViews()
        setupListeners()
    }

    private fun initViews() {
        seekPain = findViewById(R.id.seekPain)
        tvPainLevel = findViewById(R.id.tvPainLevel)
        seekWater = findViewById(R.id.seekWater)
        tvWaterLevel = findViewById(R.id.tvWaterLevel)
        chipBloodYes = findViewById(R.id.chipBloodYes)
        chipBloodNo = findViewById(R.id.chipBloodNo)
        chipFrequentYes = findViewById(R.id.chipFrequentYes)
        chipFrequentNo = findViewById(R.id.chipFrequentNo)
        etNotes = findViewById(R.id.etNotes)
        btnSave = findViewById(R.id.btnSave)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
    }

    private fun setupListeners() {
        seekPain.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                val text = when (progress) {
                    0 -> "0 - No Pain"
                    in 1..3 -> "$progress - Mild"
                    in 4..6 -> "$progress - Moderate"
                    in 7..9 -> "$progress - Severe"
                    10 -> "10 - Extreme"
                    else -> progress.toString()
                }
                tvPainLevel.text = text
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
        
        seekWater.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvWaterLevel.text = "$progress glasses"
            }
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
        
        chipBloodYes.setOnClickListener {
            bloodInUrine = 1
            chipBloodYes.isChecked = true
            chipBloodNo.isChecked = false
        }
        
        chipBloodNo.setOnClickListener {
            bloodInUrine = 0
            chipBloodNo.isChecked = true
            chipBloodYes.isChecked = false
        }
        
        chipFrequentYes.setOnClickListener {
            frequentUrination = 1
            chipFrequentYes.isChecked = true
            chipFrequentNo.isChecked = false
        }
        
        chipFrequentNo.setOnClickListener {
            frequentUrination = 0
            chipFrequentNo.isChecked = true
            chipFrequentYes.isChecked = false
        }
        
        btnSave.setOnClickListener {
            saveSymptoms()
        }
    }

    private fun saveSymptoms() {
        btnSave.isEnabled = false
        btnSave.text = "Saving..."
        
        lifecycleScope.launch {
            try {
                val request = LogSymptomsRequest(
                    painLevel = seekPain.progress,
                    waterIntake = seekWater.progress,
                    bloodInUrine = bloodInUrine,
                    frequentUrination = frequentUrination,
                    additionalNotes = etNotes.text.toString().ifEmpty { null }
                )
                
                val response = ApiClient.apiService.logSymptoms(request)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@SymptomTrackerActivity, 
                        "Symptoms logged successfully", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this@SymptomTrackerActivity, 
                        "Failed to save symptoms", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@SymptomTrackerActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                btnSave.isEnabled = true
                btnSave.text = getString(R.string.save_todays_log)
            }
        }
    }
}
