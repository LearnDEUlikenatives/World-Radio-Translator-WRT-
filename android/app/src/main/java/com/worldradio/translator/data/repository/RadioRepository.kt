package com.worldradio.translator.data.repository

import com.worldradio.translator.data.model.RadioStation
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.OkHttpClient
import okhttp3.Request

class RadioRepository(
    private val backendBaseUrl: String,
    private val client: OkHttpClient = OkHttpClient(),
    private val json: Json = Json { ignoreUnknownKeys = true; isLenient = true }
) {
    suspend fun getStations(): List<RadioStation> = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url("$backendBaseUrl/api/stations?limit=50")
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return@use emptyList<RadioStation>()

            val body = response.body?.string() ?: return@use emptyList<RadioStation>()
            val array = json.parseToJsonElement(body).jsonArray

            return@use array.mapNotNull { element ->
                try {
                    val obj = element.jsonObject
                    RadioStation(
                        stationuuid = obj["stationuuid"]?.jsonPrimitive?.contentOrNull ?: "",
                        name = obj["name"]?.jsonPrimitive?.contentOrNull ?: "Live Radio",
                        url = obj["url"]?.jsonPrimitive?.contentOrNull ?: "",
                        url_resolved = obj["url_resolved"]?.jsonPrimitive?.contentOrNull ?: "",
                        country = obj["country"]?.jsonPrimitive?.contentOrNull ?: "World",
                        countrycode = obj["countrycode"]?.jsonPrimitive?.contentOrNull ?: ""
                    )
                } catch (e: Exception) {
                    null
                }
            }
        }
    }
}
