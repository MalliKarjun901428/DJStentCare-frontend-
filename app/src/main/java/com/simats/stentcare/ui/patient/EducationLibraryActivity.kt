package com.simats.stentcare.ui.patient

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
import com.simats.stentcare.models.EducationContent
import kotlinx.coroutines.launch

class EducationLibraryActivity : AppCompatActivity() {

    private lateinit var rvArticles: RecyclerView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_education_library)
        
        initViews()
        loadArticles()
    }

    private fun initViews() {
        rvArticles = findViewById(R.id.rvArticles)
        progressBar = findViewById(R.id.progressBar)
        
        rvArticles.layoutManager = LinearLayoutManager(this)
        
        findViewById<ImageButton>(R.id.btnBack).setOnClickListener {
            finish()
        }
    }

    private fun loadArticles() {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                val response = ApiClient.apiService.getEducationContent()
                
                if (response.isSuccessful && response.body()?.success == true) {
                    val articles = response.body()?.data?.content ?: emptyList()
                    rvArticles.adapter = EducationAdapter(articles)
                }
            } catch (e: Exception) {
                Toast.makeText(this@EducationLibraryActivity, 
                    "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                progressBar.visibility = View.GONE
            }
        }
    }
}

class EducationAdapter(
    private val articles: List<EducationContent>
) : RecyclerView.Adapter<EducationAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): ViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_education, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(articles[position])
    }

    override fun getItemCount() = articles.size

    class ViewHolder(itemView: android.view.View) : RecyclerView.ViewHolder(itemView) {
        private val tvTitle: android.widget.TextView = itemView.findViewById(R.id.tvTitle)
        private val tvContent: android.widget.TextView = itemView.findViewById(R.id.tvContent)
        private val tvCategory: android.widget.TextView = itemView.findViewById(R.id.tvCategory)
        private var expanded = false

        fun bind(article: EducationContent) {
            tvTitle.text = article.title
            tvContent.text = article.contentBody ?: article.description ?: ""
            tvCategory.text = article.contentType
            
            itemView.setOnClickListener {
                expanded = !expanded
                tvContent.maxLines = if (expanded) 100 else 3
            }
        }
    }
}
