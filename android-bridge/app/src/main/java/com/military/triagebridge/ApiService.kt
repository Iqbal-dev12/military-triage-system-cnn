package com.military.triagebridge

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface TriageApiService {

    @POST("realtime-vitals")
    suspend fun sendVitals(@Body data: VitalData): Response<TriageResponse>
}
