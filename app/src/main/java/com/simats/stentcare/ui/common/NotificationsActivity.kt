package com.simats.stentcare.ui.common

import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.Notification
import kotlinx.coroutines.launch

class NotificationsActivity : AppCompatActivity() {

    private lateinit var rvNotifications: RecyclerView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: android.widget.TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notifications)
        
        initViews()
        loadNotifications()
    }

    private fun initViews() {
        rvNotifications = findViewById(R.id.rvNotifications)
        progressBar = findViewById(R.id.progressBar)
        tvEmpty = findViewById(R.id.tvEmpty)
        
        rvNotifications.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
    }

    private fun loadNotifications() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getNotifications()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val notifications = response.body()?.data?.notifications ?: emptyList()
                    
                    if (notifications.isEmpty()) {
                        tvEmpty.visibility = View.VISIBLE
                        rvNotifications.visibility = View.GONE
                    } else {
                        tvEmpty.visibility = View.GONE
                        rvNotifications.visibility = View.VISIBLE
                        rvNotifications.adapter = NotificationAdapter(notifications)
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@NotificationsActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
}

class NotificationAdapter(
    private val notifications: List<Notification>
) : RecyclerView.Adapter<NotificationAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_notification, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(notifications[position])
    }

    override fun getItemCount() = notifications.size

    class ViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle: android.widget.TextView = itemView.findViewById(R.id.tvTitle)
        private val tvMessage: android.widget.TextView = itemView.findViewById(R.id.tvMessage)
        private val tvTime: android.widget.TextView = itemView.findViewById(R.id.tvTime)

        fun bind(notification: Notification) {
            tvTitle.text = notification.title
            tvMessage.text = notification.message
            tvTime.text = notification.createdAt.substring(0, 10)
        }
    }
}
