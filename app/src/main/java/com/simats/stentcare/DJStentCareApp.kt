package com.simats.stentcare

import android.app.Application
import android.content.Context
import android.content.SharedPreferences

class DJStentCareApp : Application() {
    
    companion object {
        lateinit var instance: DJStentCareApp
            private set
        
        lateinit var prefs: SharedPreferences
            private set
    }
    
    override fun onCreate() {
        super.onCreate()
        instance = this
        prefs = getSharedPreferences("djstentcare_prefs", Context.MODE_PRIVATE)
    }
    
    // User session management
    fun saveUserSession(token: String, userId: Int, role: String, name: String) {
        prefs.edit().apply {
            putString("auth_token", token)
            putInt("user_id", userId)
            putString("user_role", role)
            putString("user_name", name)
            putBoolean("is_logged_in", true)
            apply()
        }
    }
    
    fun getAuthToken(): String? = prefs.getString("auth_token", null)
    
    fun getUserId(): Int = prefs.getInt("user_id", 0)
    
    fun getUserRole(): String? = prefs.getString("user_role", null)
    
    fun getUserName(): String? = prefs.getString("user_name", null)
    
    fun isLoggedIn(): Boolean = prefs.getBoolean("is_logged_in", false)
    
    fun hasSeenOnboarding(): Boolean = prefs.getBoolean("seen_onboarding", false)
    
    fun setSeenOnboarding() {
        prefs.edit().putBoolean("seen_onboarding", true).apply()
    }
    
    // Used by OtpVerificationActivity for quick auth save
    fun saveAuth(token: String, role: String, userId: Int) {
        prefs.edit().apply {
            putString("auth_token", token)
            putString("user_role", role)
            putInt("user_id", userId)
            putBoolean("is_logged_in", true)
            apply()
        }
    }

    fun clearAuth() {
        prefs.edit().apply {
            remove("auth_token")
            remove("user_id")
            remove("user_role")
            remove("user_name")
            putBoolean("is_logged_in", false)
            apply()
        }
    }

    fun logout() {
        prefs.edit().apply {
            remove("auth_token")
            remove("user_id")
            remove("user_role")
            remove("user_name")
            putBoolean("is_logged_in", false)
            apply()
        }
    }
}
