package com.simats.stentcare.ui.doctor

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.CalendarView
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.api.ApiClient
import com.simats.stentcare.models.CalendarEvent
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class CalendarActivity : AppCompatActivity() {

    private lateinit var calendarView: CalendarView
    private lateinit var rvEvents: RecyclerView
    private lateinit var tvSelectedDate: TextView
    private lateinit var tvNoEvents: TextView
    private lateinit var progressBar: ProgressBar

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    private val displayDateFormat = SimpleDateFormat("MMMM dd, yyyy", Locale.US)
    private var selectedDate = dateFormat.format(Date())

    // Map of date string → list of events (from CalendarResponse.calendar)
    private var calendarMap = mapOf<String, List<CalendarEvent>>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_calendar)

        initViews()
        loadCalendarEvents()
    }

    private fun initViews() {
        calendarView = findViewById(R.id.calendarView)
        rvEvents = findViewById(R.id.rvEvents)
        tvSelectedDate = findViewById(R.id.tvSelectedDate)
        tvNoEvents = findViewById(R.id.tvNoEvents)
        progressBar = findViewById(R.id.progressBar)

        rvEvents.layoutManager = LinearLayoutManager(this)

        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }

        tvSelectedDate.text = displayDateFormat.format(Date())

        calendarView.setOnDateChangeListener { _, year, month, day ->
            val calendar = Calendar.getInstance()
            calendar.set(year, month, day)
            selectedDate = dateFormat.format(calendar.time)
            tvSelectedDate.text = displayDateFormat.format(calendar.time)
            filterEventsForSelectedDate()
        }
    }

    private fun loadCalendarEvents() {
        progressBar.visibility = View.VISIBLE

        val cal = Calendar.getInstance()
        val month = cal.get(Calendar.MONTH) + 1  // Calendar.MONTH is 0-indexed
        val year = cal.get(Calendar.YEAR)

        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getCalendar(month, year)

                if (response.isSuccessful && response.body()?.success == true) {
                    val data = response.body()?.data
                    if (data != null) {
                        calendarMap = data.calendar
                        filterEventsForSelectedDate()
                    }
                } else {
                    val errMsg = response.body()?.message ?: "Failed to load calendar"
                    Toast.makeText(this@CalendarActivity, errMsg, Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@CalendarActivity,
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }

    private fun filterEventsForSelectedDate() {
        val events = calendarMap[selectedDate] ?: emptyList()

        if (events.isEmpty()) {
            tvNoEvents.visibility = View.VISIBLE
            rvEvents.visibility = View.GONE
        } else {
            tvNoEvents.visibility = View.GONE
            rvEvents.visibility = View.VISIBLE
            rvEvents.adapter = CalendarEventAdapter(events) { event ->
                if (event.stentId != null) {
                    val intent = Intent(this, StentDetailsActivity::class.java)
                    intent.putExtra("stent_id", event.id)
                    startActivity(intent)
                }
            }
        }
    }
}

class CalendarEventAdapter(
    private val events: List<CalendarEvent>,
    private val onClick: (CalendarEvent) -> Unit
) : RecyclerView.Adapter<CalendarEventAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_calendar_event, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(events[position])
    }

    override fun getItemCount() = events.size

    inner class ViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle: TextView = itemView.findViewById(R.id.tvTitle)
        private val tvPatient: TextView = itemView.findViewById(R.id.tvPatient)
        private val tvType: TextView = itemView.findViewById(R.id.tvType)

        fun bind(event: CalendarEvent) {
            // Build a readable title from event_type + stent_id or patient info
            tvTitle.text = when (event.eventType) {
                "insertion" -> "Stent Insertion: ${event.stentId ?: ""}"
                "removal"   -> "Stent Removal: ${event.stentId ?: ""}"
                "consultation" -> "Consultation"
                else -> event.eventType.replaceFirstChar(Char::uppercaseChar)
            }
            tvPatient.text = event.patientName
            tvType.text = event.eventType.replaceFirstChar(Char::uppercaseChar)

            val color = when (event.eventType) {
                "removal"  -> itemView.context.getColor(R.color.warning)
                "overdue"  -> itemView.context.getColor(R.color.error)
                else       -> itemView.context.getColor(R.color.primary)
            }
            tvType.setTextColor(color)

            itemView.setOnClickListener { onClick(event) }
        }
    }
}
