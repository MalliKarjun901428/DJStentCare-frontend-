package com.simats.stentcare.ui.patient

import android.os.Bundle
import android.widget.Button
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.simats.stentcare.R

class VideoConsultationActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_video_consultation)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        findViewById<Button>(R.id.btnStartCall).setOnClickListener {
            Toast.makeText(this, "Video call feature coming soon!", Toast.LENGTH_SHORT).show()
        }
        
        findViewById<Button>(R.id.btnSchedule).setOnClickListener {
            Toast.makeText(this, "Scheduling feature coming soon!", Toast.LENGTH_SHORT).show()
        }
    }
}
