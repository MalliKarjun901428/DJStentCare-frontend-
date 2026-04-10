package com.simats.stentcare.ui.admin

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.UserActionRequest
import com.simats.stentcare.models.UserInfo
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import kotlinx.coroutines.launch

class UserManagementActivity : AppCompatActivity() {

    private lateinit var rvUsers: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView
    private lateinit var chipGroup: ChipGroup
    
    private var currentFilter: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_management)
        
        initViews()
        
        // Handle role filtering from Intent
        val role = intent.getStringExtra("role")
        if (role != null) {
            currentFilter = role
            when (role) {
                "doctor" -> chipGroup.check(R.id.chipDoctors)
                "patient" -> chipGroup.check(R.id.chipPatients)
            }
        }
        
        loadUsers()
    }

    private fun initViews() {
        rvUsers = findViewById(R.id.rvUsers)
        progressBar = findViewById(R.id.progressBar)
        tvEmpty = findViewById(R.id.tvEmpty)
        chipGroup = findViewById(R.id.chipGroupFilter)
        
        rvUsers.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        chipGroup.setOnCheckedStateChangeListener { _, checkedIds ->
            currentFilter = when {
                checkedIds.contains(R.id.chipDoctors) -> "doctor"
                checkedIds.contains(R.id.chipPatients) -> "patient"
                else -> null
            }
            loadUsers()
        }
    }

    private fun loadUsers() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getUsers(role = currentFilter)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val users = response.body()?.data?.users ?: emptyList()
                    
                    if (users.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                        rvUsers.visibility = View.GONE
                    } else {
                        tvEmpty.visibility = View.GONE
                        rvUsers.visibility = View.VISIBLE
                        rvUsers.adapter = UserAdapter(users) { user, action ->
                            handleUserAction(user, action)
                        }
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@UserManagementActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
    
    private fun handleUserAction(user: UserInfo, action: String) {
        val message = when (action) {
            "suspend" -> "Suspend user ${user.fullName}?"
            "activate" -> "Activate user ${user.fullName}?"
            else -> return
        }
        
        AlertDialog.Builder(this)
            .setTitle("Confirm Action")
            .setMessage(message)
            .setPositiveButton("Confirm") { _, _ ->
                performAction(user, action)
            }
            .setNegativeButton("Cancel", null)
            .show()
    }
    
    private fun performAction(user: UserInfo, action: String) {
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.userAction(
                    UserActionRequest(user.id, action)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    Toast.makeText(this@UserManagementActivity, 
                        "User ${action}d successfully", Toast.LENGTH_SHORT).show()
                    loadUsers()
                } else {
                    Toast.makeText(this@UserManagementActivity, 
                        response.body()?.message ?: "Action failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@UserManagementActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

class UserAdapter(
    private val users: List<UserInfo>,
    private val onAction: (UserInfo, String) -> Unit
) : RecyclerView.Adapter<UserAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_user, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(users[position])
    }

    override fun getItemCount() = users.size

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tvName)
        private val tvEmail: TextView = itemView.findViewById(R.id.tvEmail)
        private val tvRole: TextView = itemView.findViewById(R.id.tvRole)
        private val tvStatus: TextView = itemView.findViewById(R.id.tvStatus)

        fun bind(user: UserInfo) {
            tvName.text = user.fullName
            tvEmail.text = user.email
            tvRole.text = user.role.replaceFirstChar(Char::uppercaseChar)
            
            val isActive = user.isApproved == 1 && user.isVerified == 1
            tvStatus.text = if (isActive) "Active" else "Inactive"
            tvStatus.setTextColor(itemView.context.getColor(
                if (isActive) R.color.success else R.color.error
            ))
            
            itemView.setOnLongClickListener {
                onAction(user, if (isActive) "suspend" else "activate")
                true
            }
        }
    }
}
