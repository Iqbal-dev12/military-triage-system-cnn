package com.military.triagebridge

data class VitalData(
    val heart_rate: Int,
    val spo2: Int,
    val systolic_bp: Int,
    val diastolic_bp: Int
)

data class TriageResponse(
    val triage: String,
    val reason: String,
    val vitals: Map<String, Int>
)
