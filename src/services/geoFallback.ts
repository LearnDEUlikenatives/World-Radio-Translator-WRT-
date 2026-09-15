import { LocationGeoProfile } from "../types";

export interface GeoTarget {
  country: string;
  countryCode: string;
  countryCodes: string[];
  lat: number;
  lng: number;
  language: string;
  capital: string;
  nativeGreeting: string;
  genres: string[];
  description: string;
}

export const KNOWN_GEO_TARGETS: GeoTarget[] = [
  {
    country: "France",
    countryCode: "FR",
    countryCodes: ["FR", "GB", "DE", "ES", "IT"],
    lat: 46.22,
    lng: 2.21,
    language: "French",
    capital: "Paris",
    nativeGreeting: "Bonjour",
    genres: ["Chanson Française", "French Touch House", "Indie Pop", "Classical"],
    description: "Heart of European broadcast history, boasting historic public cultural networks, contemporary electronic sounds, and rich linguistic heritage across regional frequencies."
  },
  {
    country: "United States",
    countryCode: "US",
    countryCodes: ["US", "CA", "MX", "GB"],
    lat: 37.09,
    lng: -95.71,
    language: "English",
    capital: "Washington, D.C.",
    nativeGreeting: "Hello",
    genres: ["Jazz", "Hip Hop", "Country", "Classic Rock", "Indie Pop"],
    description: "Diverse nationwide radio spectrum spanning college stations, NPR cultural broadcasting, soulful blues, and urban music waves."
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    countryCodes: ["GB", "IE", "FR", "NL"],
    lat: 55.37,
    lng: -3.43,
    language: "English",
    capital: "London",
    nativeGreeting: "Cheers",
    genres: ["Britpop", "UK Garage", "Grime", "Post-Punk", "BBC Essential News"],
    description: "Vibrant radio culture defined by pioneering public broadcasting, pirate radio lineage, underground club sounds, and worldwide speech journalism."
  },
  {
    country: "Germany",
    countryCode: "DE",
    countryCodes: ["DE", "AT", "CH", "NL", "PL"],
    lat: 51.16,
    lng: 10.45,
    language: "German",
    capital: "Berlin",
    nativeGreeting: "Guten Tag",
    genres: ["Krautrock", "Berlin Techno", "Electronic", "Classical", "Pop-Schlager"],
    description: "Dense audio landscape of regional Rundfunk public transmitters, iconic electronic club broadcasts, and classical symphonic streams."
  },
  {
    country: "Spain",
    countryCode: "ES",
    countryCodes: ["ES", "PT", "FR", "AD", "MA"],
    lat: 40.46,
    lng: -3.74,
    language: "Spanish",
    capital: "Madrid",
    nativeGreeting: "¡Hola!",
    genres: ["Flamenco", "Spanish Rock", "Reggaeton", "Indie Flamenco", "Latin Pop"],
    description: "Passionate airwaves pulsating with acoustic flamenco guitars, vibrant talk radio debates, and lively coastal rhythms across the Iberian peninsula."
  },
  {
    country: "Italy",
    countryCode: "IT",
    countryCodes: ["IT", "CH", "FR", "AT", "GR"],
    lat: 41.87,
    lng: 12.56,
    language: "Italian",
    capital: "Rome",
    nativeGreeting: "Ciao",
    genres: ["Opera", "Italo Disco", "Cantautore", "Cinematic Soundtracks", "Pop"],
    description: "Melodic Mediterranean frequencies celebrating timeless lyrical opera, stylish pop songwriting, and dynamic talk radio culture."
  },
  {
    country: "Japan",
    countryCode: "JP",
    countryCodes: ["JP", "KR", "TW", "CN"],
    lat: 36.20,
    lng: 138.25,
    language: "Japanese",
    capital: "Tokyo",
    nativeGreeting: "Konnichiwa",
    genres: ["City Pop", "J-Rock", "Anime Soundtracks", "Traditional Enka", "Future Bass"],
    description: "High-fidelity soundscapes blending vintage 1980s city pop grooves, high-energy anime radio, ambient synthesis, and crisp news broadcasts."
  },
  {
    country: "Brazil",
    countryCode: "BR",
    countryCodes: ["BR", "AR", "UY", "PY", "CO"],
    lat: -14.23,
    lng: -51.92,
    language: "Portuguese",
    capital: "Brasília",
    nativeGreeting: "Olá!",
    genres: ["Bossa Nova", "Samba", "MPB", "Baile Funk", "Forró"],
    description: "Warm tropical sound waves brimming with rhythmic acoustic percussion, soulful bossa nova chord changes, and energizing street festivals."
  },
  {
    country: "Mexico",
    countryCode: "MX",
    countryCodes: ["MX", "US", "GT", "CO", "ES"],
    lat: 23.63,
    lng: -102.55,
    language: "Spanish",
    capital: "Mexico City",
    nativeGreeting: "¡Qué tal!",
    genres: ["Mariachi", "Ranchera", "Cumbia Sonidera", "Latin Rock", "Bolero"],
    description: "Rich cultural broadcasting tapestry of heartfelt mariachi brass, traditional ballads, and urban alternative frequencies."
  },
  {
    country: "Australia",
    countryCode: "AU",
    countryCodes: ["AU", "NZ", "ID", "SG"],
    lat: -25.27,
    lng: 133.77,
    language: "English",
    capital: "Canberra",
    nativeGreeting: "G'day",
    genres: ["Aussie Indie", "Surf Rock", "First Nations Sounds", "Alternative", "Electronic"],
    description: "Broad coastal and outback radio networks famed for discovery of independent rock, community broadcasting, and surf-drenched soundscapes."
  },
  {
    country: "India",
    countryCode: "IN",
    countryCodes: ["IN", "LK", "NP", "BD"],
    lat: 20.59,
    lng: 78.96,
    language: "Hindi",
    capital: "New Delhi",
    nativeGreeting: "Namaste",
    genres: ["Bollywood Classical", "Sufi", "Indian Classical Ragas", "Indipop", "Punjabi Beats"],
    description: "A subcontinent of multi-lingual broadcast stations filled with rich sitar melodies, festive folk instruments, and cinematic vocal harmonies."
  },
  {
    country: "South Africa",
    countryCode: "ZA",
    countryCodes: ["ZA", "NA", "BW", "ZW", "MZ"],
    lat: -30.55,
    lng: 22.93,
    language: "English, Zulu, Xhosa",
    capital: "Pretoria",
    nativeGreeting: "Sawubona",
    genres: ["Amapiano", "Kwaito", "Afro House", "Marabi", "Gospel"],
    description: "The rhythmic heartbeat of Southern Africa, famous for deep basslines, energetic Amapiano log drums, and soulful community voices."
  }
];

export function getFallbackProfileByCoords(lat: number, lng: number): LocationGeoProfile {
  let closest = KNOWN_GEO_TARGETS[0];
  let minDist = Infinity;

  for (const t of KNOWN_GEO_TARGETS) {
    const dist = Math.pow(t.lat - lat, 2) + Math.pow(t.lng - lng, 2);
    if (dist < minDist) {
      minDist = dist;
      closest = t;
    }
  }

  return {
    country: closest.country,
    countryCode: closest.countryCode,
    countryCodes: closest.countryCodes,
    language: closest.language,
    capital: closest.capital,
    description: closest.description,
    nativeGreeting: closest.nativeGreeting,
    genres: closest.genres
  };
}

export function getDefaultLocationProfile(country = "France", code = "FR"): LocationGeoProfile {
  const match = KNOWN_GEO_TARGETS.find(t => t.countryCode === code.toUpperCase()) || KNOWN_GEO_TARGETS[0];
  return {
    country: match.country,
    countryCode: match.countryCode,
    countryCodes: match.countryCodes,
    language: match.language,
    capital: match.capital,
    description: match.description,
    nativeGreeting: match.nativeGreeting,
    genres: match.genres
  };
}
