package com.military.triagebridge

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.fitness.Fitness
import com.google.android.gms.fitness.FitnessOptions
import com.google.android.gms.fitness.data.DataType
import com.google.android.gms.fitness.data.Field
import com.google.android.gms.fitness.request.DataReadRequest
import com.military.triagebridge.databinding.ActivityMainBinding
import kotlinx.coroutines.*
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    // Job for the periodic vitals sending loop
    private var sendingJob: Job? = null
    private var isSending = false

    private val GOOGLE_FIT_PERMISSIONS_REQUEST_CODE = 1001

    private val fitnessOptions = FitnessOptions.builder()
        .addDataType(DataType.TYPE_HEART_RATE_BPM, FitnessOptions.ACCESS_READ)
        .addDataType(DataType.TYPE_SPO2, FitnessOptions.ACCESS_READ)
        .build()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnToggle.setOnClickListener {
            if (isSending) {
                stopSending()
            } else {
                startSending()
            }
        }

        binding.swAutoSync.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                checkFitnessPermissions()
            }
        }
    }

    private fun checkFitnessPermissions() {
        val account = GoogleSignIn.getAccountForExtension(this, fitnessOptions)
        if (!GoogleSignIn.hasPermissions(account, fitnessOptions)) {
            GoogleSignIn.requestPermissions(
                this,
                GOOGLE_FIT_PERMISSIONS_REQUEST_CODE,
                account,
                fitnessOptions
            )
        } else {
            Toast.makeText(this, "🤖 Autonomous Mode Ready", Toast.LENGTH_SHORT).show()
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == GOOGLE_FIT_PERMISSIONS_REQUEST_CODE) {
            if (resultCode == RESULT_OK) {
                Toast.makeText(this, "✅ Watch Sync Authorized", Toast.LENGTH_SHORT).show()
            } else {
                binding.swAutoSync.isChecked = false
                Toast.makeText(this, "❌ Permission Denied", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun startSending() {
        isSending = true
        binding.btnToggle.text = "Stop Sending"
        binding.tvStatus.text = "Status: Sending every 5s..."
        binding.tvStatus.setTextColor(Color.parseColor("#10b981"))

        sendingJob = lifecycleScope.launch {
            while (isActive) {
                if (binding.swAutoSync.isChecked) {
                    fetchLatestWatchVitals()
                }

                val hr = binding.etHeartRate.text.toString().toIntOrNull()
                val spo2 = binding.etSpo2.text.toString().toIntOrNull()
                val sysBp = binding.etSystolicBp.text.toString().toIntOrNull()
                val diaBp = binding.etDiastolicBp.text.toString().toIntOrNull()

                if (hr != null && spo2 != null && sysBp != null && diaBp != null) {
                    sendVitals(hr, spo2, sysBp, diaBp)
                } else if (!binding.swAutoSync.isChecked) {
                    withContext(Dispatchers.Main) {
                        binding.tvStatus.text = "Status: Waiting for input..."
                        binding.tvStatus.setTextColor(Color.YELLOW)
                    }
                }
                delay(5000L) // 5 seconds
            }
        }
    }

    private fun fetchLatestWatchVitals() {
        val account = GoogleSignIn.getAccountForExtension(this, fitnessOptions)
        if (!GoogleSignIn.hasPermissions(account, fitnessOptions)) return

        val endTime = System.currentTimeMillis()
        val startTime = endTime - TimeUnit.MINUTES.toMillis(5)

        val readRequest = DataReadRequest.Builder()
            .read(DataType.TYPE_HEART_RATE_BPM)
            .read(DataType.TYPE_SPO2)
            .setTimeRange(startTime, endTime, TimeUnit.MILLISECONDS)
            .setLimit(1)
            .build()

        Fitness.getHistoryClient(this, account)
            .readData(readRequest)
            .addOnSuccessListener { response ->
                for (dataSet in response.dataSets) {
                    if (dataSet.dataPoints.isNotEmpty()) {
                        val dp = dataSet.dataPoints[0]
                        when (dataSet.dataType) {
                            DataType.TYPE_HEART_RATE_BPM -> {
                                val hr = dp.getValue(Field.FIELD_BPM).asFloat().toInt()
                                binding.etHeartRate.setText(hr.toString())
                            }
                            DataType.TYPE_SPO2 -> {
                                val spo2 = dp.getValue(Field.FIELD_SPO2).asFloat().toInt()
                                binding.etSpo2.setText(spo2.toString())
                            }
                        }
                    }
                }
            }
            .addOnFailureListener { e ->
                Log.e("FitBridge", "Failed to fetch fit data", e)
            }
    }

    private fun stopSending() {
        sendingJob?.cancel()
        isSending = false
        binding.btnToggle.text = "Start Sending"
        binding.tvStatus.text = "Status: Stopped"
        binding.tvStatus.setTextColor(Color.GRAY)
    }

    private suspend fun sendVitals(hr: Int, spo2: Int, sysBp: Int, diaBp: Int) {
        try {
            val serverUrl = binding.etServerUrl.text.toString().trim()
            val response = RetrofitClient.getApiService(serverUrl).sendVitals(
                VitalData(
                    heart_rate = hr,
                    spo2 = spo2,
                    systolic_bp = sysBp,
                    diastolic_bp = diaBp
                )
            )

            withContext(Dispatchers.Main) {
                if (response.isSuccessful) {
                    val result = response.body()
                    result?.let { displayTriageResult(it) }
                } else {
                    binding.tvStatus.text = "Status: Error ${response.code()}"
                    binding.tvStatus.setTextColor(Color.RED)
                }
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                binding.tvStatus.text = "Error: ${e.localizedMessage ?: "Connection failed"}"
                binding.tvStatus.setTextColor(Color.RED)
                Log.e("MainActivity", "Send failed", e)
            }
        }
    }

    private fun displayTriageResult(result: TriageResponse) {
        binding.tvTriageResult.text = result.triage
        binding.tvTriageReason.text = result.reason
        binding.tvTriageReason.visibility = View.VISIBLE

        val (bgColor, textColor) = when (result.triage) {
            "RED" -> Pair("#ef4444", "#ffffff")
            "YELLOW" -> Pair("#f59e0b", "#1a1a1a")
            "GREEN" -> Pair("#10b981", "#ffffff")
            "BLACK" -> Pair("#1a1a1a", "#ffffff")
            else -> Pair("#6b7280", "#ffffff")
        }

        binding.cardTriageResult.setCardBackgroundColor(Color.parseColor(bgColor))
        binding.tvTriageResult.setTextColor(Color.parseColor(textColor))
        binding.tvTriageReason.setTextColor(Color.parseColor(textColor))

        val emoji = when (result.triage) {
            "RED" -> "🔴"
            "YELLOW" -> "🟡"
            "GREEN" -> "🟢"
            "BLACK" -> "⚫"
            else -> "❓"
        }
        binding.tvTriageEmoji.text = emoji
    }

    override fun onDestroy() {
        super.onDestroy()
        sendingJob?.cancel()
    }
}
