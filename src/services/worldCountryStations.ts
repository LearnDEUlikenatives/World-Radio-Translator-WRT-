import { RadioStation } from "../types";

export interface CountryInfo {
  code: string;
  name: string;
  lat: number;
  lng: number;
  capital: string;
  language: string;
  stations: RadioStation[];
}

export const ALL_GOOGLE_PLAY_COUNTRIES_STATIONS: Record<string, CountryInfo> = {
  US: {
    code: "US",
    name: "United States",
    lat: 37.09,
    lng: -95.71,
    capital: "Washington, D.C.",
    language: "English",
    stations: [
      {
        stationuuid: "us-wnyc-fm",
        name: "WNYC 93.9 FM - New York Public Radio",
        url: "https://fm939.wnyc.org/wnycfm",
        url_resolved: "https://fm939.wnyc.org/wnycfm",
        homepage: "https://www.wnyc.org",
        tags: "news,npr,public radio,new york,talk",
        country: "United States",
        countrycode: "US",
        state: "New York",
        language: "english",
        votes: 32000,
        clickcount: 75000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 40.7128,
        geo_long: -74.0060
      },
      {
        stationuuid: "us-kexp",
        name: "KEXP 90.3 FM - Seattle Music Pioneer",
        url: "https://kexp.streamguys1.com/kexp128.mp3",
        url_resolved: "https://kexp.streamguys1.com/kexp128.mp3",
        homepage: "https://www.kexp.org",
        tags: "indie,alternative,rock,seattle,eclectic",
        country: "United States",
        countrycode: "US",
        state: "Washington",
        language: "english",
        votes: 41000,
        clickcount: 98000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 47.6062,
        geo_long: -122.3321
      },
      {
        stationuuid: "us-somafm-groovesalad",
        name: "SomaFM: Groove Salad",
        url: "https://ice1.somafm.com/groovesalad-128-mp3",
        url_resolved: "https://ice1.somafm.com/groovesalad-128-mp3",
        homepage: "https://somafm.com",
        tags: "ambient,downtempo,chillout,electronic",
        country: "United States",
        countrycode: "US",
        state: "California",
        language: "english",
        votes: 52000,
        clickcount: 140000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 37.7749,
        geo_long: -122.4194
      }
    ]
  },
  GB: {
    code: "GB",
    name: "United Kingdom",
    lat: 55.37,
    lng: -3.43,
    capital: "London",
    language: "English",
    stations: [
      {
        stationuuid: "gb-bbc-radio-1",
        name: "BBC Radio 1",
        url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
        url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one",
        homepage: "https://www.bbc.co.uk/radio1",
        tags: "pop,dance,charts,uk,london",
        country: "United Kingdom",
        countrycode: "GB",
        state: "London",
        language: "english",
        votes: 45000,
        clickcount: 112000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 51.5074,
        geo_long: -0.1278
      },
      {
        stationuuid: "gb-bbc-radio-4",
        name: "BBC Radio 4",
        url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm",
        url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_fourfm",
        homepage: "https://www.bbc.co.uk/radio4",
        tags: "news,speech,drama,documentary,uk",
        country: "United Kingdom",
        countrycode: "GB",
        state: "London",
        language: "english",
        votes: 38000,
        clickcount: 89000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 51.5074,
        geo_long: -0.1278
      }
    ]
  },
  FR: {
    code: "FR",
    name: "France",
    lat: 46.22,
    lng: 2.21,
    capital: "Paris",
    language: "French",
    stations: [
      {
        stationuuid: "fr-franceinfo",
        name: "France Info",
        url: "https://icecast.radiofrance.fr/franceinfo-midfi.mp3",
        url_resolved: "https://icecast.radiofrance.fr/franceinfo-midfi.mp3",
        homepage: "https://www.francetvinfo.fr",
        tags: "news,talk,information,france,paris",
        country: "France",
        countrycode: "FR",
        state: "Paris",
        language: "french",
        votes: 35000,
        clickcount: 81000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 48.8566,
        geo_long: 2.3522
      },
      {
        stationuuid: "fr-fip",
        name: "FIP Radio",
        url: "https://icecast.radiofrance.fr/fip-midfi.mp3",
        url_resolved: "https://icecast.radiofrance.fr/fip-midfi.mp3",
        homepage: "https://www.radiofrance.fr/fip",
        tags: "eclectic,jazz,world,pop,paris",
        country: "France",
        countrycode: "FR",
        state: "Paris",
        language: "french",
        votes: 42000,
        clickcount: 95000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 48.8566,
        geo_long: 2.3522
      }
    ]
  },
  DE: {
    code: "DE",
    name: "Germany",
    lat: 51.16,
    lng: 10.45,
    capital: "Berlin",
    language: "German",
    stations: [
      {
        stationuuid: "de-deutschlandfunk",
        name: "Deutschlandfunk",
        url: "https://st01.ssl.dlf.de/dlf/01/128/mp3/stream.mp3",
        url_resolved: "https://st01.ssl.dlf.de/dlf/01/128/mp3/stream.mp3",
        homepage: "https://www.deutschlandfunk.de",
        tags: "news,talk,culture,germany,berlin",
        country: "Germany",
        countrycode: "DE",
        state: "Cologne",
        language: "german",
        votes: 29000,
        clickcount: 67000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 50.9375,
        geo_long: 6.9603
      }
    ]
  },
  ZA: {
    code: "ZA",
    name: "South Africa",
    lat: -30.55,
    lng: 22.93,
    capital: "Pretoria",
    language: "English, Zulu",
    stations: [
      {
        stationuuid: "za-metro-fm",
        name: "Metro FM",
        url: "https://edge.iono.fm/xpn/sabc-metrofm-mp3",
        url_resolved: "https://edge.iono.fm/xpn/sabc-metrofm-mp3",
        homepage: "https://www.metrofm.co.za",
        tags: "rnb,hip hop,urban,kwaito,south africa,johannesburg",
        country: "South Africa",
        countrycode: "ZA",
        state: "Johannesburg, Gauteng",
        language: "english,zulu",
        votes: 18450,
        clickcount: 32400,
        codec: "MP3",
        bitrate: 128,
        geo_lat: -26.2041,
        geo_long: 28.0473
      },
      {
        stationuuid: "za-jacaranda-fm",
        name: "Jacaranda FM",
        url: "https://jacarandafm.antfarm.co.za/jacarandafm",
        url_resolved: "https://jacarandafm.antfarm.co.za/jacarandafm",
        homepage: "https://www.jacarandafm.com",
        tags: "adult contemporary,pop,rock,south africa,pretoria",
        country: "South Africa",
        countrycode: "ZA",
        state: "Pretoria, Gauteng",
        language: "english,afrikaans",
        votes: 14200,
        clickcount: 28900,
        codec: "MP3",
        bitrate: 128,
        geo_lat: -25.7479,
        geo_long: 28.2293
      },
      {
        stationuuid: "za-ukhozi-fm",
        name: "Ukhozi FM",
        url: "https://edge.iono.fm/xpn/sabc-ukhozifm-mp3",
        url_resolved: "https://edge.iono.fm/xpn/sabc-ukhozifm-mp3",
        homepage: "https://www.ukhozifm.co.za",
        tags: "maskandi,gospel,african,durban,isizulu",
        country: "South Africa",
        countrycode: "ZA",
        state: "Durban, KwaZulu-Natal",
        language: "zulu",
        votes: 19800,
        clickcount: 36200,
        codec: "MP3",
        bitrate: 128,
        geo_lat: -29.8587,
        geo_long: 31.0218
      }
    ]
  },
  IN: {
    code: "IN",
    name: "India",
    lat: 20.59,
    lng: 78.96,
    capital: "New Delhi",
    language: "Hindi, English",
    stations: [
      {
        stationuuid: "in-air-fm-gold",
        name: "All India Radio - AIR FM Gold",
        url: "https://air.live-streams.nl/gold.mp3",
        url_resolved: "https://air.live-streams.nl/gold.mp3",
        homepage: "https://newsonair.gov.in",
        tags: "news,classic bollywood,talk,india,delhi",
        country: "India",
        countrycode: "IN",
        state: "New Delhi",
        language: "hindi,english",
        votes: 28000,
        clickcount: 62000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: 28.6139,
        geo_long: 77.2090
      }
    ]
  },
  BR: {
    code: "BR",
    name: "Brazil",
    lat: -14.23,
    lng: -51.92,
    capital: "Brasília",
    language: "Portuguese",
    stations: [
      {
        stationuuid: "br-antena-1",
        name: "Antena 1 FM 94.7",
        url: "https://stream.antena1.com.br/stream/1/128/mp3",
        url_resolved: "https://stream.antena1.com.br/stream/1/128/mp3",
        homepage: "https://www.antena1.com.br",
        tags: "adult contemporary,pop,classic,sao paulo",
        country: "Brazil",
        countrycode: "BR",
        state: "São Paulo",
        language: "portuguese",
        votes: 25000,
        clickcount: 58000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: -23.5505,
        geo_long: -46.6333
      }
    ]
  },
  JP: {
    code: "JP",
    name: "Japan",
    lat: 36.20,
    lng: 138.25,
    capital: "Tokyo",
    language: "Japanese",
    stations: [
      {
        stationuuid: "jp-nhk-r1",
        name: "NHK Radio 1 Tokyo",
        url: "https://nhkliveradio-i.akamaihd.net/hls/live/512301/r1-tunein/index.m3u8",
        url_resolved: "https://nhkliveradio-i.akamaihd.net/hls/live/512301/r1-tunein/index.m3u8",
        homepage: "https://www.nhk.or.jp/radio",
        tags: "news,public,talk,tokyo,japan",
        country: "Japan",
        countrycode: "JP",
        state: "Tokyo",
        language: "japanese",
        votes: 31000,
        clickcount: 70000,
        codec: "AAC",
        bitrate: 128,
        geo_lat: 35.6762,
        geo_long: 139.6503
      }
    ]
  },
  AU: {
    code: "AU",
    name: "Australia",
    lat: -25.27,
    lng: 133.77,
    capital: "Canberra",
    language: "English",
    stations: [
      {
        stationuuid: "au-abc-triple-j",
        name: "Triple J - ABC Sydney",
        url: "https://live-radio01.media.abc.net.au/netradio/triplej.m3u",
        url_resolved: "https://live-radio01.media.abc.net.au/netradio/triplej.m3u",
        homepage: "https://www.abc.net.au/triplej",
        tags: "alternative,indie,rock,sydney,australia",
        country: "Australia",
        countrycode: "AU",
        state: "New South Wales",
        language: "english",
        votes: 34000,
        clickcount: 79000,
        codec: "MP3",
        bitrate: 128,
        geo_lat: -33.8688,
        geo_long: 151.2093
      }
    ]
  }
};

// Helper function to calculate distance in km using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds all pre-listed stations across all countries within 250km of the given (lat, lng).
 */
export function getStationsWithinRadius(lat: number, lng: number, maxRadiusKm = 250): RadioStation[] {
  const matchedStations: Array<RadioStation & { distanceKm: number }> = [];

  for (const countryKey of Object.keys(ALL_GOOGLE_PLAY_COUNTRIES_STATIONS)) {
    const countryData = ALL_GOOGLE_PLAY_COUNTRIES_STATIONS[countryKey];
    for (const station of countryData.stations) {
      if (station.geo_lat != null && station.geo_long != null) {
        const dist = calculateDistance(lat, lng, station.geo_lat, station.geo_long);
        if (dist <= maxRadiusKm) {
          matchedStations.push({
            ...station,
            distanceKm: Math.round(dist),
            withinRadius: true
          });
        }
      }
    }
  }

  // If no stations are within 250km, fall back to the closest country's curated stations so the map is never empty
  if (matchedStations.length === 0) {
    let closestCountry = ALL_GOOGLE_PLAY_COUNTRIES_STATIONS["US"];
    let minCountryDist = Infinity;

    for (const countryKey of Object.keys(ALL_GOOGLE_PLAY_COUNTRIES_STATIONS)) {
      const c = ALL_GOOGLE_PLAY_COUNTRIES_STATIONS[countryKey];
      const d = calculateDistance(lat, lng, c.lat, c.lng);
      if (d < minCountryDist) {
        minCountryDist = d;
        closestCountry = c;
      }
    }

    return closestCountry.stations.map(st => ({
      ...st,
      distanceKm: Math.round(calculateDistance(lat, lng, st.geo_lat || closestCountry.lat, st.geo_long || closestCountry.lng)),
      withinRadius: false
    }));
  }

  // Sort by closest distance
  matchedStations.sort((a, b) => a.distanceKm - b.distanceKm);
  return matchedStations;
}
