package com.simats.stentcare.ui.patient

import android.os.Bundle
import android.widget.EditText
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.Message
import com.simats.stentcare.models.SendMessageRequest
import kotlinx.coroutines.launch

class ChatActivity : AppCompatActivity() {

    private lateinit var rvMessages: RecyclerView
    private lateinit var etMessage: EditText
    private lateinit var btnSend: ImageButton
    
    private var doctorId: Int = 0
    private var doctorName: String = ""
    private var currentUserId: Int = 0
    private val messages = mutableListOf<Message>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_chat)
        
        doctorId = intent.getIntExtra("doctor_id", 0)
        doctorName = intent.getStringExtra("doctor_name") ?: "Doctor"
        currentUserId = DJStentCareApp.instance.getUserId()
        
        initViews()
        loadMessages()
    }

    private fun initViews() {
        rvMessages = findViewById(R.id.rvMessages)
        etMessage = findViewById(R.id.etMessage)
        btnSend = findViewById(R.id.btnSend)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
        
        findViewById<android.widget.TextView>(R.id.tvDoctorName).text = doctorName
        
        rvMessages.layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }
        
        btnSend.setOnClickListener {
            val messageText = etMessage.text.toString().trim()
            if (messageText.isNotEmpty()) {
                sendMessage(messageText)
            }
        }
    }

    private fun loadMessages() {
        if (doctorId == 0) {
            // Try to get doctor from patient dashboard
            loadDoctorAndMessages()
            return
        }
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getMessages(doctorId)
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    
                    if (data != null) {
                        messages.clear()
                        messages.addAll(data.messages)
                        doctorName = data.partner.fullName
                        
                        findViewById<android.widget.TextView>(R.id.tvDoctorName).text = doctorName
                        
                        rvMessages.adapter = ChatAdapter(messages, currentUserId)
                        rvMessages.scrollToPosition(messages.size - 1)
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, 
                    "Error loading messages", Toast.LENGTH_SHORT).show()
            }
        }
    }
    
    private fun loadDoctorAndMessages() {
        lifecycleScope.launch {
            try {
                val dashResponse = ApiClient.apiService.getPatientDashboard()
                if (dashResponse.isSuccessful && dashResponse.body()?.success == true) {
                    val doctor = dashResponse.body()?.data?.doctor
                    if (doctor != null) {
                        doctorId = doctor.id
                        doctorName = doctor.fullName
                        loadMessages()
                    } else {
                        Toast.makeText(this@ChatActivity, 
                            "No doctor assigned", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun sendMessage(text: String) {
        etMessage.setText("")
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.sendMessage(
                    SendMessageRequest(doctorId, text)
                )
                
                if (response.isSuccessful && response.body()?.success == true) {
                    loadMessages()
                } else {
                    Toast.makeText(this@ChatActivity, 
                        "Failed to send message", Toast.LENGTH_SHORT).show()
                    etMessage.setText(text)
                }
            } catch (e: Exception) {
                Toast.makeText(this@ChatActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                etMessage.setText(text)
            }
        }
    }
}

class ChatAdapter(
    private val messages: List<Message>,
    private val currentUserId: Int
) : RecyclerView.Adapter<ChatAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val layout = if (viewType == 1) R.layout.item_message_sent else R.layout.item_message_received
        val view = android.view.LayoutInflater.from(parent.context).inflate(layout, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(messages[position])
    }

    override fun getItemCount() = messages.size
    
    override fun getItemViewType(position: Int): Int {
        return if (messages[position].senderId == currentUserId) 1 else 0
    }

    class ViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        private val tvMessage: android.widget.TextView = itemView.findViewById(R.id.tvMessage)
        private val tvTime: android.widget.TextView = itemView.findViewById(R.id.tvTime)

        fun bind(message: Message) {
            tvMessage.text = message.message
            tvTime.text = message.sentAt.substring(11, 16) // HH:mm
        }
    }
}
