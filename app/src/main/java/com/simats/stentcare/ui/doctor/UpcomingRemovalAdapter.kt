package com.simats.stentcare.ui.doctor

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.simats.stentcare.R
import com.simats.stentcare.models.UpcomingRemoval

class UpcomingRemovalAdapter(
    private val removals: List<UpcomingRemoval>,
    private val onClick: (UpcomingRemoval) -> Unit
) : RecyclerView.Adapter<UpcomingRemovalAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_upcoming_removal, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(removals[position])
    }

    override fun getItemCount() = removals.size

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvPatientName: TextView = itemView.findViewById(R.id.tvPatientName)
        private val tvStentId: TextView = itemView.findViewById(R.id.tvStentId)
        private val tvDate: TextView = itemView.findViewById(R.id.tvDate)
        private val tvDaysLeft: TextView = itemView.findViewById(R.id.tvDaysLeft)

        fun bind(removal: UpcomingRemoval) {
            tvPatientName.text = removal.patientName
            tvStentId.text = removal.stentId
            tvDate.text = removal.expectedRemovalDate
            
            val daysText = when {
                removal.daysLeft < 0 -> "${-removal.daysLeft} days overdue"
                removal.daysLeft == 0 -> "Today"
                removal.daysLeft == 1 -> "Tomorrow"
                else -> "${removal.daysLeft} days left"
            }
            tvDaysLeft.text = daysText
            
            // Color based on urgency
            val color = when {
                removal.daysLeft < 0 -> itemView.context.getColor(R.color.error)
                removal.daysLeft <= 3 -> itemView.context.getColor(R.color.warning)
                else -> itemView.context.getColor(R.color.success)
            }
            tvDaysLeft.setTextColor(color)
            
            itemView.setOnClickListener { onClick(removal) }
        }
    }
}
