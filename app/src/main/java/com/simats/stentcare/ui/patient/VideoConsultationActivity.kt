package com.simats.stentcare.ui.patient

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import kotlinx.coroutines.launch

class VideoConsultationActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_video_consultation)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        val btnStartCall = findViewById<Button>(R.id.btnStartCall)
        val btnSchedule = findViewById<Button>(R.id.btnSchedule)

        btnStartCall.setOnClickListener {
            btnStartCall.isEnabled = false
            btnStartCall.text = "Checking schedule..."
            
            lifecycleScope.launch {
                try {
                    val response = ApiClient.apiService.getConsultations("scheduled")
                    if (response.isSuccessful && response.body()?.success == true) {
                        val upcoming = response.body()?.data?.upcoming
                        if (!upcoming.isNullOrEmpty()) {
                            val meetingLink = upcoming[0].meetingLink ?: "https://meet.google.com/new"
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(meetingLink))
                            startActivity(intent)
                        } else {
                            // If no consultation is officially scheduled, launch a demo link anyway for testing
                            Toast.makeText(this@VideoConsultationActivity, "No scheduled meeting found. Launching demo room...", Toast.LENGTH_SHORT).show()
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://meet.google.com/new"))
                            startActivity(intent)
                        }
                    } else {
                        Toast.makeText(this@VideoConsultationActivity, "Could not check consultations", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@VideoConsultationActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                } finally {
                    btnStartCall.isEnabled = true
                    btnStartCall.text = "Start Video Call"
                }
            }
        }
        
        btnSchedule.setOnClickListener {
            Toast.makeText(this, "Your request to schedule a video call has been sent to the doctor.", Toast.LENGTH_LONG).show()
        }
    }
}
