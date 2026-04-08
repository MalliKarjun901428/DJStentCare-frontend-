package com.simats.stentcare.ui.onboarding

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.viewpager2.widget.ViewPager2
import com.simats.stentcare.DJStentCareApp
import com.simats.stentcare.R
import com.simats.stentcare.ui.auth.RoleSelectionActivity

class OnboardingActivity : AppCompatActivity() {
    
    private lateinit var viewPager: ViewPager2
    private lateinit var indicatorContainer: LinearLayout
    private lateinit var btnNext: Button
    private lateinit var tvSkip: TextView
    
    private val onboardingItems = listOf(
        OnboardingItem(
            R.drawable.ic_onboarding_track,
            "Track DJ Stents Digitally",
            "Monitor your DJ stent placement and removal dates with ease"
        ),
        OnboardingItem(
            R.drawable.ic_onboarding_comm,
            "Secure Doctor-Patient Communication",
            "Stay connected with your healthcare provider through secure messaging"
        ),
        OnboardingItem(
            R.drawable.ic_onboarding_remind,
            "Never Miss Stent Removal",
            "Get timely reminders for your DJ stent removal appointments"
        )
    )
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_onboarding)
        
        viewPager = findViewById(R.id.viewPager)
        indicatorContainer = findViewById(R.id.indicatorContainer)
        btnNext = findViewById(R.id.btnNext)
        tvSkip = findViewById(R.id.tvSkip)
        
        val adapter = OnboardingAdapter(onboardingItems)
        viewPager.adapter = adapter
        
        setupIndicators()
        setCurrentIndicator(0)
        
        viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                setCurrentIndicator(position)
                btnNext.text = if (position == onboardingItems.size - 1) "Get Started" else "Next"
                tvSkip.visibility = if (position == onboardingItems.size - 1) View.GONE else View.VISIBLE
            }
        })
        
        btnNext.setOnClickListener {
            if (viewPager.currentItem < onboardingItems.size - 1) {
                viewPager.currentItem += 1
            } else {
                finishOnboarding()
            }
        }
        
        tvSkip.setOnClickListener {
            finishOnboarding()
        }
    }
    
    private fun setupIndicators() {
        val indicators = arrayOfNulls<ImageView>(onboardingItems.size)
        val layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.WRAP_CONTENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            setMargins(8, 0, 8, 0)
        }
        
        for (i in indicators.indices) {
            indicators[i] = ImageView(applicationContext).apply {
                setImageDrawable(ContextCompat.getDrawable(
                    applicationContext, 
                    R.drawable.indicator_inactive
                ))
                this.layoutParams = layoutParams
            }
            indicatorContainer.addView(indicators[i])
        }
    }
    
    private fun setCurrentIndicator(index: Int) {
        for (i in 0 until indicatorContainer.childCount) {
            val imageView = indicatorContainer.getChildAt(i) as ImageView
            imageView.setImageDrawable(ContextCompat.getDrawable(
                applicationContext,
                if (i == index) R.drawable.indicator_active else R.drawable.indicator_inactive
            ))
        }
    }
    
    private fun finishOnboarding() {
        DJStentCareApp.instance.setSeenOnboarding()
        startActivity(Intent(this, RoleSelectionActivity::class.java))
        finish()
    }
}

data class OnboardingItem(
    val imageRes: Int,
    val title: String,
    val description: String
)
