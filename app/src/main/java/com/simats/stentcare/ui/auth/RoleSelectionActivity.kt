package com.simats.stentcare.ui.auth

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView
import com.simats.stentcare.R

class RoleSelectionActivity : AppCompatActivity() {
    
    private var selectedRole: String? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_role_selection)

        val cardDoctor = findViewById<MaterialCardView>(R.id.cardDoctor)
        val cardPatient = findViewById<MaterialCardView>(R.id.cardPatient)
        val cardAdmin = findViewById<MaterialCardView>(R.id.cardAdmin)

        cardDoctor.setOnClickListener {
            selectedRole = "doctor"
            updateSelection(cardDoctor, listOf(cardPatient, cardAdmin))
            navigateToLogin(allowSignup = true)
        }
        
        cardPatient.setOnClickListener {
            selectedRole = "patient"
            updateSelection(cardPatient, listOf(cardDoctor, cardAdmin))
            navigateToLogin(allowSignup = true)
        }
        
        cardAdmin.setOnClickListener {
            selectedRole = "admin"
            updateSelection(cardAdmin, listOf(cardDoctor, cardPatient))
            navigateToLogin(allowSignup = true) // Admin can now signup for testing
        }
    }

    private fun updateSelection(selected: MaterialCardView, others: List<MaterialCardView>) {
        selected.setCardBackgroundColor(getColor(R.color.primary_very_light))
        selected.strokeColor = getColor(R.color.primary)
        selected.strokeWidth = 4

        others.forEach { card ->
            card.setCardBackgroundColor(getColor(R.color.surface))
            card.strokeColor = getColor(R.color.divider)
            card.strokeWidth = 2
        }
    }

    private fun navigateToLogin(allowSignup: Boolean) {
        val intent = Intent(this, LoginActivity::class.java).apply {
            putExtra("role", selectedRole)
            putExtra("allow_signup", allowSignup)
        }
        startActivity(intent)
    }
}
