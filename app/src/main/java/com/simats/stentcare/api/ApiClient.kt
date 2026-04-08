package com.simats.stentcare.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import com.simats.stentcare.DJStentCareApp

/**
 * API Client Configuration
 * 
 * ⚡ CHANGE BASE_URL TO SWITCH SERVERS ⚡
 * 
 * For Android Emulator → XAMPP: http://10.0.2.2/dj_stent_care_backend/api/
 * For Real Phone → Local PC: http://YOUR_PC_IP/dj_stent_care_backend/api/
 * For Production: https://yourdomain.com/api/
 */
object ApiClient {
    
    // ============================================================
    // ⚡ TO SWITCH ENVIRONMENTS — ONLY CHANGE THIS ONE LINE ⚡
    // ============================================================
    //
    // Option 1 — Android Emulator connecting to Django on same PC:
    // private const val BASE_URL = "http://10.0.2.2:8000/api/"
    //
    // Option 2 — Real Device on the same WiFi as your PC:
    // private const val BASE_URL = "http://192.168.x.x:8000/api/"
    // (replace x.x with your PC's local IP shown by ipconfig / ifconfig)
    //
    // Option 3 — Current device IP (CHANGE THIS to your server's IP):
    private const val BASE_URL = "https://nonelementary-minta-unthwacked.ngrok-free.dev/api/"
    //
    // Option 4 — Production server:
    // private const val BASE_URL = "https://yourdomain.com/api/"
    //
    // ⚠️  NO OTHER FILE NEEDS TO CHANGE. All API calls go through here.
    // ============================================================
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor { chain ->
                val originalRequest = chain.request()
                val token = DJStentCareApp.instance.getAuthToken()
                
                val newRequest = if (token != null) {
                    originalRequest.newBuilder()
                        .header("Authorization", "Bearer $token")
                        .build()
                } else {
                    originalRequest
                }
                
                chain.proceed(newRequest)
            }
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    val apiService: ApiService by lazy {
        retrofit.create(ApiService::class.java)
    }
}
