package com.simats.stentcare.ui.admin

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.LinearLayout
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.ui.auth.LoginActivity
import com.simats.stentcare.ui.common.AboutActivity
import com.simats.stentcare.ui.common.HelpSupportActivity
import com.simats.stentcare.ui.common.NotificationsActivity

class AdminSettingsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        
        initViews()
    }

    private fun initViews() {
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        // Notifications
        findViewById<LinearLayout>(R.id.layoutNotifications)?.setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }
        
        // Help & Support
        findViewById<LinearLayout>(R.id.layoutHelp)?.setOnClickListener {
            startActivity(Intent(this, HelpSupportActivity::class.java))
        }
        
        // About
        findViewById<LinearLayout>(R.id.layoutAbout)?.setOnClickListener {
            startActivity(Intent(this, AboutActivity::class.java))
        }
        
        // Logout
        findViewById<LinearLayout>(R.id.layoutLogout)?.setOnClickListener {
            showLogoutDialog()
        }
    }
    
    private fun showLogoutDialog() {
        AlertDialog.Builder(this)
            .setTitle("Logout")
            .setMessage("Are you sure you want to logout?")
            .setPositiveButton("Logout") { _, _ ->
                DJStentCareApp.instance.clearAuth()
                val intent = Intent(this, LoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
