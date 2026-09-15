package com.worldradio.translator.data.model

import kotlinx.serialization.Serializable

@Serializable
data class RadioStation(
    val stationuuid: String = "",
    val name: String = "Live Radio",
    val url: String = "",
    val url_resolved: String = "",
    val country: String = "World",
    val countrycode: String = "",
    val language: String = "",
    val tags: String = "",
    val favicon: String = ""
)
