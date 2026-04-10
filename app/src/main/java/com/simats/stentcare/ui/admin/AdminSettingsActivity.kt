package com.simats.stentcare.ui.admin

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.LinearLayout
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.ui.common.NotificationsActivity
import com.simats.stentcare.ui.common.AboutActivity
import com.simats.stentcare.ui.common.HelpSupportActivity
import com.simats.stentcare.ui.auth.RoleSelectionActivity
import com.simats.stentcare.ui.common.ChangePasswordActivity
import android.widget.ImageView
import android.widget.TextView
import android.net.Uri
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import java.util.UUID

class AdminSettingsActivity : AppCompatActivity() {

    private lateinit var ivProfileImage: ImageView
    private lateinit var tvAdminName: TextView

    private val imageLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { uploadImage(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)
        
        initViews()
        loadProfile()
    }

    private fun initViews() {
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        // Notifications
        findViewById<LinearLayout>(R.id.layoutNotifications)?.setOnClickListener {
            startActivity(Intent(this, NotificationsActivity::class.java))
        }

        // Edit Profile
        findViewById<LinearLayout>(R.id.layoutEditProfile)?.setOnClickListener {
            startActivity(Intent(this, AdminProfileActivity::class.java))
        }

        // Change Password
        findViewById<LinearLayout>(R.id.layoutChangePassword)?.setOnClickListener {
            startActivity(Intent(this, ChangePasswordActivity::class.java))
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

        ivProfileImage = findViewById(R.id.ivProfileImage)
        tvAdminName = findViewById(R.id.tvAdminName)

        ivProfileImage.setOnClickListener {
            imageLauncher.launch("image/*")
        }
    }

    private fun loadProfile() {
        tvAdminName.text = DJStentCareApp.instance.getUserName() ?: "Administrator"
        // In a real app, we'd load the URL from a profile API
    }

    private fun uploadImage(uri: Uri) {
        lifecycleScope.launch {
            try {
                Toast.makeText(this@AdminSettingsActivity, "Uploading...", Toast.LENGTH_SHORT).show()
                val fileName = UUID.randomUUID().toString() + ".jpg"
                val ref = FirebaseStorage.getInstance().reference.child("profiles/$fileName")
                
                ref.putFile(uri).await()
                val url = ref.downloadUrl.await().toString()
                
                // For Admin, we'll just show it immediately and potentially save locally 
                // as there's no specific admin update API in ApiService yet.
                Glide.with(this@AdminSettingsActivity)
                    .load(url)
                    .into(ivProfileImage)
                
                Toast.makeText(this@AdminSettingsActivity, "Profile photo updated!", Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@AdminSettingsActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun showLogoutDialog() {
        AlertDialog.Builder(this)
            .setTitle("Logout")
            .setMessage("Are you sure you want to logout?")
            .setPositiveButton("Logout") { _, _ ->
                DJStentCareApp.instance.logout()
                val intent = Intent(this, RoleSelectionActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
}
