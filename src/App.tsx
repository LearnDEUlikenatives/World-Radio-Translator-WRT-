import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Info,
  ShieldAlert,
  Radio,
  Sparkles,
  Share2,
  Check,
  Mic,
  MicOff,
  Languages,
  Volume2,
  RefreshCw,
  ScrollText,
  Copy,
  Trash2,
  Download,
  CheckCheck,
  Sun,
  Moon,
  Crown,
  Sliders,
  Activity,
  Heart,
  Globe2,
  Library,
  Zap,
  Gift,
  Bookmark,
  CheckCircle2,
  UserPlus,
  UserCheck,
  User
} from "lucide-react";

import WorldMap from "./components/WorldMap";
import StationList from "./components/StationList";
import AudioPlayer from "./components/AudioPlayer";
import AudioVisualizer from "./components/AudioVisualizer";
import AudioEnhancer from "./components/AudioEnhancer";
import AdBanner from "./components/AdBanner";
import InterstitialModal from "./components/InterstitialModal";
import RewardedAdModal from "./components/RewardedAdModal";
import PaywallModal from "./components/PaywallModal";
import ManageSubscriptionModal from "./components/ManageSubscriptionModal";
import FavoritesLibrary from "./components/FavoritesLibrary";
import RegisterModal from "./components/RegisterModal";
import {
  RadioStation,
  LocationGeoProfile,
  SubscriptionState,
  AdConfig,
  RecentlyPlayedItem,
  VisualizerMode,
  AudioEnhancements,
  SavedTranscriptItem
} from "./types";
import { LiveTranslateClient, LiveTranslateState } from "./services/liveTranslateClient";
import { audioEngine } from "./services/audioEngine";
import { getFallbackProfileByCoords, getDefaultLocationProfile } from "./services/geoFallback";

const SUPPORTED_LANGUAGES = [
  "Arabic",
  "Bengali",
  "Bulgarian",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Gujarati",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kannada",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Malayalam",
  "Marathi",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese"
];


const LANGUAGE_CODE_MAP: Record<string, string> = {
  "Arabic": "ar",
  "Bengali": "bn",
  "Bulgarian": "bg",
  "Chinese (Simplified)": "zh-CN",
  "Chinese (Traditional)": "zh-TW",
  "Croatian": "hr",
  "Czech": "cs",
  "Danish": "da",
  "Dutch": "nl",
  "English": "en",
  "Estonian": "et",
  "Finnish": "fi",
  "French": "fr",
  "German": "de",
  "Greek": "el",
  "Gujarati": "gu",
  "Hebrew": "he",
  "Hindi": "hi",
  "Hungarian": "hu",
  "Indonesian": "id",
  "Italian": "it",
  "Japanese": "ja",
  "Kannada": "kn",
  "Korean": "ko",
  "Latvian": "lv",
  "Lithuanian": "lt",
  "Malayalam": "ml",
  "Marathi": "mr",
  "Norwegian": "no",
  "Persian": "fa",
  "Polish": "pl",
  "Portuguese": "pt",
  "Romanian": "ro",
  "Russian": "ru",
  "Serbian": "sr",
  "Slovak": "sk",
  "Slovenian": "sl",
  "Spanish": "es",
  "Swahili": "sw",
  "Swedish": "sv",
  "Tamil": "ta",
  "Telugu": "te",
  "Thai": "th",
  "Turkish": "tr",
  "Ukrainian": "uk",
  "Urdu": "ur",
  "Vietnamese": "vi"
};

function getClientLanguageCode(lang: string | undefined): string {
  if (!lang) return "";
  const l = lang.toLowerCase().trim();
  
  // 1. Direct or partial keys matching
  for (const [name, code] of Object.entries(LANGUAGE_CODE_MAP)) {
    const nameLower = name.toLowerCase();
    if (l === nameLower || l.includes(nameLower) || nameLower.includes(l)) {
      return code;
    }
  }
  
  // 2. Direct code match (e.g. "es", "sv", "pt")
  const codes = Object.values(LANGUAGE_CODE_MAP);
  if (codes.includes(l)) {
    return l;
  }
  
  // 3. Custom hand-coded popular patterns / ISO-639 codes
  if (l.includes("ara") || l === "ar") return "ar";
  if (l.includes("ben") || l === "bn") return "bn";
  if (l.includes("bul") || l === "bg") return "bg";
  if (l.includes("chi") || l.includes("zho") || l === "zh") return "zh-CN";
  if (l.includes("hrv") || l === "hr") return "hr";
  if (l.includes("cze") || l.includes("ces") || l === "cs") return "cs";
  if (l.includes("dan") || l === "da") return "da";
  if (l.includes("dut") || l.includes("nld") || l === "nl") return "nl";
  if (l.includes("eng") || l === "un" || l === "en") return "en";
  if (l.includes("est") || l === "et") return "et";
  if (l.includes("fin") || l === "fi") return "fi";
  if (l.includes("fre") || l.includes("fra") || l === "fr") return "fr";
  if (l.includes("ger") || l.includes("deu") || l === "de") return "de";
  if (l.includes("gre") || l.includes("ell") || l === "el") return "el";
  if (l.includes("guj") || l === "gu") return "gu";
  if (l.includes("heb") || l === "he") return "he";
  if (l.includes("hin") || l === "hi") return "hi";
  if (l.includes("hun") || l === "hu") return "hu";
  if (l.includes("ind") || l === "id") return "id";
  if (l.includes("ita") || l === "it") return "it";
  if (l.includes("jpn") || l === "ja") return "ja";
  if (l.includes("kan") || l === "kn") return "kn";
  if (l.includes("kor") || l === "ko") return "ko";
  if (l.includes("lav") || l === "lv") return "lv";
  if (l.includes("lit") || l === "lt") return "lt";
  if (l.includes("mal") || l === "ml") return "ml";
  if (l.includes("mar") || l === "mr") return "mr";
  if (l.includes("nor") || l === "no") return "no";
  if (l.includes("fas") || l.includes("per") || l === "fa") return "fa";
  if (l.includes("pol") || l === "pl") return "pl";
  if (l.includes("por") || l === "pt") return "pt";
  if (l.includes("ron") || l.includes("rum") || l === "ro") return "ro";
  if (l.includes("rus") || l === "ru") return "ru";
  if (l.includes("srp") || l === "sr") return "sr";
  if (l.includes("slk") || l.includes("slo") || l === "sk") {
    if (l.includes("slovenian") || l === "sl") return "sl";
    return "sk";
  }
  if (l.includes("slv") || l === "sl") return "sl";
  if (l.includes("spa") || l === "es") return "es";
  if (l.includes("swa") || l === "sw") return "sw";
  if (l.includes("swe") || l === "sv") return "sv";
  if (l.includes("tam") || l === "ta") return "ta";
  if (l.includes("tel") || l === "te") return "te";
  if (l.includes("tha") || l === "th") return "th";
  if (l.includes("tur") || l === "tr") return "tr";
  if (l.includes("ukr") || l === "uk") return "uk";
  if (l.includes("urd") || l === "ur") return "ur";
  if (l.includes("vie") || l === "vi") return "vi";
  
  return l;
}

function isSameLanguage(langA: string | undefined, langB: string | undefined): boolean {
  if (!langA || !langB) return false;
  const codeA = getClientLanguageCode(langA);
  const codeB = getClientLanguageCode(langB);
  if (codeA && codeB && codeA === codeB) return true;

  const a = langA.toLowerCase().trim();
  const b = langB.toLowerCase().trim();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const len = Math.min(a.length, b.length, 3);
  if (len >= 3 && a.slice(0, len) === b.slice(0, len)) return true;
  return false;
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("world_radio_dark_mode") === "true";
  });

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("world_radio_dark_mode", String(nextMode));
  };

  // View state: "explore" (map & list) or "library" (favorites & history)
  const [currentView, setCurrentView] = useState<"explore" | "library">("explore");

  // Visualizer & DSP Drawer open/close
  const [showAudioStudio, setShowAudioStudio] = useState<boolean>(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("spectrum");

  // Upfront Registration & Account State
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem("wrt_user_email") || "");
  const [userName, setUserName] = useState<string>(() => localStorage.getItem("wrt_user_name") || "");

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionState>(() => {
    const savedTier = (localStorage.getItem("wrt_subscription_tier") || "free") as any;
    const savedToken = localStorage.getItem("wrt_subscription_token") || "";
    const savedEmail = localStorage.getItem("wrt_user_email") || "";
    return {
      tier: savedTier,
      token: savedToken,
      email: savedEmail,
      autoRenew: true,
      dailySecondsUsed: 0,
      lastQuotaDate: new Date().toISOString().split("T")[0]
    };
  });

  const handleUserRegistered = (email: string, name?: string) => {
    setUserEmail(email);
    if (name) setUserName(name);
    setSubscription(prev => ({ ...prev, email }));
    if (email) {
      // Check if user has an active subscription record
      fetch("/api/subscription/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
        .then(r => r.json())
        .then(data => {
          if (data.found && data.tier) {
            setSubscription(prev => ({
              ...prev,
              tier: data.tier,
              email: data.email,
              token: data.token,
              validUntil: data.validUntil
            }));
            localStorage.setItem("wrt_subscription_tier", data.tier);
            if (data.token) localStorage.setItem("wrt_subscription_token", data.token);
          }
        })
        .catch(() => {});
    }
  };

  // Saved Transcripts & Generated Text Persistence
  const [savedTranscripts, setSavedTranscripts] = useState<SavedTranscriptItem[]>(() => {
    try {
      const local = localStorage.getItem("wrt_saved_transcripts");
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [savedTranscriptSuccess, setSavedTranscriptSuccess] = useState<boolean>(false);
  const [savedSnippetIds, setSavedSnippetIds] = useState<Set<string>>(new Set());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Audio DSP enhancements (Equalizer)
  const [enhancements, setEnhancements] = useState<AudioEnhancements>({
    bassBoost: 50,
    treble: 50,
    vocalClarity: 50
  });

  const handleEnhancementsChange = (updated: AudioEnhancements) => {
    setEnhancements(updated);
    audioEngine.applyEnhancements(updated);
  };

  // Monetization modals
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showManageSub, setShowManageSub] = useState<boolean>(false);
  const [showInterstitial, setShowInterstitial] = useState<boolean>(false);
  const [showRewardedModal, setShowRewardedModal] = useState<boolean>(false);

  // AdMob config & frequency tracking
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);
  const [stationChangeCount, setStationChangeCount] = useState<number>(0);

  // Translation quota for free tier (in seconds; default 300s = 5 mins, boosted by +900s = 15 mins)
  const [translationSecondsLeft, setTranslationSecondsLeft] = useState<number>(() => {
    const saved = localStorage.getItem("wrt_translation_seconds_left");
    return saved ? parseInt(saved, 10) : 300;
  });

  // Favorites & Playback History
  const [favorites, setFavorites] = useState<RadioStation[]>(() => {
    try {
      const saved = localStorage.getItem("wrt_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedItem[]>(() => {
    try {
      const saved = localStorage.getItem("wrt_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProfile, setSelectedProfile] = useState<LocationGeoProfile | null>(null);
  const [activeStation, setActiveStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(500);
  const [copied, setCopied] = useState(false);

  // Real-time Voice to Voice Gemini Live Translate Setup
  const [liveClient] = useState(() => new LiveTranslateClient());
  const [liveState, setLiveState] = useState<LiveTranslateState>({
    status: "idle",
    error: null,
    userTranscript: "",
    modelTranscript: "",
    turns: [],
  });
  const [liveTargetLang, setLiveTargetLang] = useState<string>("English");
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const transcriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Load AdMob configuration
  useEffect(() => {
    fetch("/api/ads/config")
      .then((res) => res.json())
      .then((cfg: AdConfig) => setAdConfig(cfg))
      .catch((err) => console.warn("Could not load AdMob config:", err));
  }, []);

  // Verify license key on startup if available
  useEffect(() => {
    const token = localStorage.getItem("wrt_subscription_token");
    if (token) {
      fetch("/api/subscription/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.active) {
            setSubscription({
              tier: data.tier,
              token: data.token,
              validUntil: data.validUntil,
              autoRenew: true
            });
            localStorage.setItem("wrt_subscription_tier", data.tier);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Persist favorites & history
  useEffect(() => {
    localStorage.setItem("wrt_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("wrt_history", JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  // Persist translation quota
  useEffect(() => {
    localStorage.setItem("wrt_translation_seconds_left", String(translationSecondsLeft));
  }, [translationSecondsLeft]);

  // Translation quota timer for free tier users
  useEffect(() => {
    if (subscription.tier !== "free") return;
    if (liveState.status !== "connected") return;

    const timer = setInterval(() => {
      setTranslationSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          liveClient.disconnect();
          setLiveState(liveClient.getLiveState());
          setShowRewardedModal(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [subscription.tier, liveState.status, liveClient]);

  const toggleFavorite = (station: RadioStation) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.stationuuid === station.stationuuid);
      if (exists) {
        return prev.filter((s) => s.stationuuid !== station.stationuuid);
      } else {
        return [station, ...prev];
      }
    });
  };

  const handleClearHistory = () => {
    setRecentlyPlayed([]);
    localStorage.removeItem("wrt_history");
  };

  const handleSubscriptionSuccess = (tier: "pro" | "vip", token: string) => {
    setSubscription({
      tier,
      token,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true
    });
    localStorage.setItem("wrt_subscription_tier", tier);
    localStorage.setItem("wrt_subscription_token", token);
    setShowPaywall(false);
  };

  const handleRewardGranted = () => {
    // Add 15 minutes (900 seconds) of free translation
    setTranslationSecondsLeft((prev) => prev + 900);
    setShowRewardedModal(false);
  };

  const toggleLiveTranslation = async () => {
    const currentStatus = liveClient.getLiveState().status;
    if (currentStatus === "connected" || currentStatus === "connecting") {
      liveClient.disconnect();
      setLiveState(liveClient.getLiveState());
    } else {
      // Check quota if free tier
      if (subscription.tier === "free" && translationSecondsLeft <= 0) {
        setShowRewardedModal(true);
        return;
      }

      await liveClient.connect(liveTargetLang, (updatedState) => {
        setLiveState({ ...updatedState });
      }, undefined, activeStation?.language);
    }
  };

  const handleCopyTranscript = () => {
    if (liveState.turns.length === 0 && !liveState.userTranscript && !liveState.modelTranscript) return;
    
    let text = "=== World Radio Translator Transcript ===\n";
    text += `Target Language Selected: ${liveTargetLang}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    liveState.turns.forEach((turn, idx) => {
      const timeStr = new Date(turn.timestamp).toLocaleTimeString();
      text += `[Turn ${idx + 1} - ${timeStr}]\n`;
      text += `Captured Audio (Original): ${turn.originalText}\n`;
      text += `Interpreter (${liveTargetLang}): ${turn.translatedText}\n\n`;
    });

    if (liveState.userTranscript) {
      text += `[*Live Decoding*] Captured Audio (Original):\n${liveState.userTranscript}\n\n`;
    }
    if (liveState.modelTranscript) {
      text += `[*Live Decoding*] Interpreter (${liveTargetLang}):\n${liveState.modelTranscript}\n\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    });
  };

  const handleDownloadTranscript = () => {
    if (liveState.turns.length === 0 && !liveState.userTranscript && !liveState.modelTranscript) return;

    let text = "=== World Radio Translator Transcript ===\n";
    text += `Target Language Selected: ${liveTargetLang}\n`;
    text += `Date: ${new Date().toLocaleDateString()}\n\n`;

    liveState.turns.forEach((turn, idx) => {
      const timeStr = new Date(turn.timestamp).toLocaleTimeString();
      text += `[Turn ${idx + 1} - ${timeStr}]\n`;
      text += `Captured Audio (Original): ${turn.originalText}\n`;
      text += `Interpreter (${liveTargetLang}): ${turn.translatedText}\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `world_radio_translation_transcript_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearSessionTranscript = () => {
    liveClient.clearHistory();
    setLiveState(liveClient.getLiveState());
  };

  const handleSaveSessionTranscript = async () => {
    if (liveState.turns.length === 0 && !liveState.userTranscript && !liveState.modelTranscript) return;

    const userEmail = subscription.email || localStorage.getItem("wrt_user_email") || undefined;
    const turnsToSave = [...liveState.turns];
    if (liveState.userTranscript || liveState.modelTranscript) {
      turnsToSave.push({
        timestamp: Date.now(),
        originalText: liveState.userTranscript || "(Captured audio segment)",
        translatedText: liveState.modelTranscript || "(Interpreted segment)"
      });
    }

    const newTranscript: SavedTranscriptItem = {
      id: `transcript_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      stationName: activeStation?.name || "Global Radio Broadcast",
      stationCountry: activeStation?.country,
      stationUuid: activeStation?.stationuuid,
      stationUrl: activeStation?.url_resolved || activeStation?.url,
      targetLang: liveTargetLang,
      sourceLang: activeStation?.language,
      timestamp: Date.now(),
      turns: turnsToSave,
      title: `${activeStation?.name || "Radio"} Broadcast Translation`
    };

    const updated = [newTranscript, ...savedTranscripts.filter(t => t.id !== newTranscript.id)];
    setSavedTranscripts(updated);
    localStorage.setItem("wrt_saved_transcripts", JSON.stringify(updated));

    // Also sync to server
    try {
      await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTranscript, email: userEmail })
      });
    } catch (err) {
      console.warn("Failed to sync transcript to server:", err);
    }

    setSavedTranscriptSuccess(true);
    setSaveToast("Full transcript saved to your Library!");
    setTimeout(() => setSavedTranscriptSuccess(false), 2500);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleSaveTurnSnippet = async (turn: { timestamp: number; originalText: string; translatedText: string }) => {
    const userEmail = subscription.email || localStorage.getItem("wrt_user_email") || undefined;

    const newTranscript: SavedTranscriptItem = {
      id: `snippet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      stationName: activeStation?.name || "Radio Broadcast Snippet",
      stationCountry: activeStation?.country,
      stationUuid: activeStation?.stationuuid,
      stationUrl: activeStation?.url_resolved || activeStation?.url,
      targetLang: liveTargetLang,
      sourceLang: activeStation?.language,
      timestamp: turn.timestamp || Date.now(),
      originalText: turn.originalText,
      translatedText: turn.translatedText,
      turns: [turn],
      isSnippet: true,
      title: `Snippet from ${activeStation?.name || "Broadcast"}`
    };

    const updated = [newTranscript, ...savedTranscripts.filter(t => t.id !== newTranscript.id)];
    setSavedTranscripts(updated);
    localStorage.setItem("wrt_saved_transcripts", JSON.stringify(updated));

    setSavedSnippetIds(prev => new Set(prev).add(`${turn.timestamp}`));
    setSaveToast("Translation snippet saved to Library!");
    setTimeout(() => setSaveToast(null), 3500);

    try {
      await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTranscript, email: userEmail })
      });
    } catch (err) {
      console.warn("Failed to sync snippet to server:", err);
    }
  };

  const handleDeleteTranscript = async (id: string) => {
    const updated = savedTranscripts.filter(t => t.id !== id);
    setSavedTranscripts(updated);
    localStorage.setItem("wrt_saved_transcripts", JSON.stringify(updated));

    try {
      await fetch(`/api/transcripts/${id}`, { method: "DELETE" });
    } catch {}
  };

  // Sync initial saved transcripts from server
  useEffect(() => {
    fetch("/api/transcripts")
      .then(r => r.json())
      .then(data => {
        if (data.transcripts && Array.isArray(data.transcripts) && data.transcripts.length > 0) {
          setSavedTranscripts(prev => {
            const map = new Map<string, SavedTranscriptItem>();
            prev.forEach(item => map.set(item.id, item));
            data.transcripts.forEach((item: SavedTranscriptItem) => map.set(item.id, item));
            const combined = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
            localStorage.setItem("wrt_saved_transcripts", JSON.stringify(combined));
            return combined;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptContainerRef.current) {
      const container = transcriptContainerRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [liveState.turns, liveState.userTranscript, liveState.modelTranscript]);

  useEffect(() => {
    return () => {
      liveClient.disconnect();
    };
  }, [liveClient]);

  // Synchronize translation session with radio playing state
  useEffect(() => {
    if (!isPlaying) {
      const currentStatus = liveClient.getLiveState().status;
      if (currentStatus === "connected" || currentStatus === "connecting") {
        liveClient.disconnect();
        setLiveState(liveClient.getLiveState());
      }
    }
  }, [isPlaying, liveClient]);

  // Sync theme-class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("world_radio_dark_mode", String(darkMode));
  }, [darkMode]);

  // Parse URL query coordinates on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLat = params.get("lat");
    const urlLng = params.get("lng");
    const urlRadius = params.get("radius");

    const initialLat = urlLat ? parseFloat(urlLat) : 46.2276;
    const initialLng = urlLng ? parseFloat(urlLng) : 2.2137;
    const initialRadius = urlRadius ? parseInt(urlRadius, 10) : 500;

    setSelectedCoords({ lat: initialLat, lng: initialLng });
    setRadiusKm(initialRadius);

    setProfileLoading(true);
    fetch("/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: initialLat,
        lng: initialLng,
        radiusKm: initialRadius,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSelectedProfile(data);
        setProfileLoading(false);
      })
      .catch((err) => {
        console.warn("Initial vicinity profile fallback used:", err?.message || err);
        setSelectedProfile(getDefaultLocationProfile("France", "FR"));
        setProfileLoading(false);
      });
  }, []);

  const updateProfile = async (lat: number, lng: number, radius: number) => {
    setProfileLoading(true);
    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat,
          lng,
          radiusKm: radius,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: LocationGeoProfile = await response.json();
      setSelectedProfile(data);
    } catch (err) {
      console.warn("Geocoding using offline mathematical fallback:", err);
      const fallback = getFallbackProfileByCoords(lat, lng);
      setSelectedProfile(fallback);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleMapLocationClick = (coords: { lat: number; lng: number }) => {
    setSelectedCoords(coords);
    updateProfile(coords.lat, coords.lng, radiusKm);
  };

  const handleRadiusChangeEnd = () => {
    if (selectedCoords) {
      updateProfile(selectedCoords.lat, selectedCoords.lng, radiusKm);
    }
  };

  const handleSelectStation = (station: RadioStation) => {
    const wasTranslating = liveState.status === "connected" || liveState.status === "connecting";
    if (wasTranslating) {
      liveClient.disconnect();
      liveClient.clearHistory();
      setLiveState(liveClient.getLiveState());
    }

    setActiveStation(station);
    setIsPlaying(true);

    // Record in recently played
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((item) => item.station.stationuuid !== station.stationuuid);
      return [{ station, timestamp: Date.now() }, ...filtered.slice(0, 49)];
    });

    // Check station change interstitial trigger for free tier
    if (subscription.tier === "free") {
      const nextCount = stationChangeCount + 1;
      setStationChangeCount(nextCount);
      const cap = adConfig?.stationChangeFrequencyCap || 4;
      if (nextCount > 0 && nextCount % cap === 0) {
        setShowInterstitial(true);
      }
    }

    if (wasTranslating) {
      setTimeout(() => {
        liveClient.connect(liveTargetLang, (updatedState) => {
          setLiveState({ ...updatedState });
        }, undefined, station.language);
      }, 600);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Top Application Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-3 sm:px-5 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Left: Brand Logo & View Switcher */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
                <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-display font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-tight">
                  World Radio
                </h1>
                <p className="text-[10px] text-slate-400 hidden lg:block">
                  Live speech-to-speech AI translation & Web Audio DSP
                </p>
              </div>
            </div>

            {/* Navigation Tabs: Explore vs Library aligned cleanly next to brand */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 flex-shrink-0">
              <button
                onClick={() => setCurrentView("explore")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  currentView === "explore"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Explore</span>
              </button>

              <button
                onClick={() => setCurrentView("library")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  currentView === "library"
                    ? "bg-white dark:bg-slate-900 text-rose-500 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5 fill-current flex-shrink-0" />
                <span>Library ({favorites.length + savedTranscripts.length})</span>
              </button>
            </div>
          </div>

          {/* Right Toolbar Actions: Studio, Upfront Register/Account, Upgrade Pro, Day/Night */}
          <div className="flex items-center justify-start md:justify-end gap-1.5 sm:gap-2 w-full md:w-auto touch-scroll-x py-1 px-0.5 sm:px-0 scroll-smooth">
            {/* Equalizer / Studio Drawer Toggle */}
            <button
              onClick={() => setShowAudioStudio(!showAudioStudio)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border flex-shrink-0 ${
                showAudioStudio
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50"
              }`}
              title="Toggle Web Audio Studio (Equalizer & Visualizer)"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Studio</span>
            </button>

            {/* Upfront Free Registration / User Account */}
            <button
              onClick={() => setShowRegisterModal(true)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border flex-shrink-0 ${
                userEmail
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50"
              }`}
              title={userEmail ? `Account: ${userEmail}` : "Register free upfront to backup favorites & transcripts"}
            >
              {userEmail ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="max-w-[80px] sm:max-w-[110px] truncate">{userName || userEmail.split("@")[0]}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Register Free</span>
                </>
              )}
            </button>

            {/* Subscription Status & Upgrade Button */}
            {subscription.tier === "free" ? (
              <button
                onClick={() => setShowPaywall(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-sm shadow-amber-500/20 cursor-pointer flex-shrink-0 active:scale-95"
                title="Upgrade to Pro: Ad-Free & Unlimited 24/7 Translation"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Upgrade Pro</span>
              </button>
            ) : (
              <button
                onClick={() => setShowManageSub(true)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border flex-shrink-0 ${
                  subscription.tier === "vip"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                }`}
                title="Manage membership"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span className="capitalize">{subscription.tier} Active</span>
              </button>
            )}

            {/* Day / Night Mode Switcher */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex-shrink-0"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </header>

      {/* Top Monetization Banner for Free Tier Users */}
      {subscription.tier === "free" && (
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-5 pt-3">
          <AdBanner
            tier={subscription.tier}
            onOpenUpgrade={() => setShowPaywall(true)}
            adConfig={adConfig}
          />
        </div>
      )}

      {/* Main Content Workspace Layout */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-140px)]">
        <div className="flex-1 p-3 sm:p-5 flex flex-col gap-4 lg:gap-5 w-full max-w-7xl mx-auto">
          
          {/* Audio Studio Drawer (Collapsible Visualizer + DSP Equalizer) */}
          <AnimatePresence>
            {showAudioStudio && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-white dark:bg-slate-900 p-4 md:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
                  {/* Left Column: Visualizer */}
                  <div className="lg:col-span-7 flex flex-col gap-3">
                    <AudioVisualizer
                      isPlaying={isPlaying}
                      mode={visualizerMode}
                      onModeChange={setVisualizerMode}
                    />
                  </div>

                  {/* Right Column: DSP Equalizer & Presets */}
                  <div className="lg:col-span-5">
                    <AudioEnhancer
                      enhancements={enhancements}
                      onChange={handleEnhancementsChange}
                      tier={subscription.tier}
                      onOpenUpgrade={() => setShowPaywall(true)}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gemini Live Voice-to-Voice Translation Dashboard */}
          <section className="bg-white dark:bg-slate-900 border border-emerald-500/25 dark:border-emerald-500/20 rounded-3xl p-4 sm:p-5 flex flex-col gap-4 shadow-md">
            
            {/* Header row: Title, Status, and Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              
              {/* Title & Info */}
              <div className="flex items-start sm:items-center gap-3">
                <div className={`p-2.5 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  liveState.status === "connected" 
                    ? "bg-emerald-500 text-white animate-pulse shadow-lg shadow-emerald-500/30" 
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}>
                  <Radio className={`w-5 h-5 ${liveState.status === "connected" ? "animate-pulse" : ""}`} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                      Gemini Live Radio Stream Interpreter
                    </h2>
                    {subscription.tier === "free" ? (
                      <span className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        {Math.floor(translationSecondsLeft / 60)}m {translationSecondsLeft % 60}s Free Left
                      </span>
                    ) : (
                      <span className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono">
                        Unlimited 24/7 VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time speech-to-text transcription and speech-to-speech simultaneous interpretation
                  </p>
                </div>
              </div>

              {/* Controls Toolbar: Language Picker + Boost/Save + Primary Button */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                
                {/* Language Picker */}
                <div 
                  className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex-1 sm:flex-initial"
                  title="Select target translation language"
                >
                  <Languages className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">To:</span>
                  <select
                    value={liveTargetLang}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setLiveTargetLang(newLang);
                      const currentStatus = liveClient.getLiveState().status;
                      const isStreamActive = currentStatus === "connected" || currentStatus === "connecting";
                      if (isStreamActive) {
                        liveClient.disconnect();
                        liveClient.clearHistory();
                        liveClient.connect(newLang, (updatedState) => {
                          setLiveState({ ...updatedState });
                        }, undefined, activeStation?.language);
                      }
                    }}
                    className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Free quota boost button */}
                {subscription.tier === "free" && translationSecondsLeft < 300 && (
                  <button
                    onClick={() => setShowRewardedModal(true)}
                    className="px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0"
                    title="Watch a short ad to earn +15 minutes translation"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>+15m Boost</span>
                  </button>
                )}

                {/* Main Action Button */}
                <button
                  onClick={toggleLiveTranslation}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-initial flex-shrink-0 ${
                    liveState.status === "connected"
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                      : liveState.status === "connecting"
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                  }`}
                >
                  <span>
                    {liveState.status === "connected"
                      ? "Stop Translation"
                      : liveState.status === "connecting"
                      ? "Connecting..."
                      : "Start Live Translation"}
                  </span>
                </button>
              </div>

            </div>

            {/* Error message */}
            {liveState.error && (
              <div className="flex items-center gap-2 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs px-3.5 py-2.5 rounded-xl border border-rose-500/20">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{liveState.error}</span>
              </div>
            )}

            {liveState.status === "connecting" && (
              <div className="flex items-center gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs px-3.5 py-2.5 rounded-xl border border-amber-500/20">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
                <span>Establishing connection with Gemini Live API...</span>
              </div>
            )}

            {liveState.status === "connected" && (
              <div className="flex flex-col gap-2 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs px-3.5 py-2.5 rounded-2xl border border-emerald-500/25">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2 mb-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold">Live broadcast interpretation active to {liveTargetLang}.</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="h-4 w-[2px] bg-emerald-500/40 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                    <span className="h-6 w-[2px] bg-emerald-500/60 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <span className="h-3 w-[2px] bg-emerald-500/30 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                    <span className="h-5 w-[2px] bg-emerald-500/70 rounded-full animate-pulse" style={{ animationDelay: "0s" }} />
                    <span className="h-4 w-[2px] bg-emerald-500/40 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Broadcast Transcription Feed */}
            {(liveState.status === "connected" || liveState.status === "error" || liveState.status === "connecting" || liveState.turns.length > 0 || liveState.userTranscript || liveState.modelTranscript) && (
              <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 p-3.5 sm:p-4 shadow-sm flex flex-col gap-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-emerald-500" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                        Live Broadcast Transcription Feed
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                        Continuous log of captured and translated broadcast audio
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                    <button
                      onClick={handleSaveSessionTranscript}
                      title="Save full transcript to your Library"
                      disabled={liveState.turns.length === 0 && !liveState.userTranscript && !liveState.modelTranscript}
                      className={`p-1 px-2.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                        savedTranscriptSuccess
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
                      }`}
                    >
                      {savedTranscriptSuccess ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-white animate-scale" />
                          <span>Saved to Library!</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                          <span>Save Transcript</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyTranscript}
                      title="Copy full transcript"
                      className="p-1 px-2.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      {copiedTranscript ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-500 animate-scale" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadTranscript}
                      title="Download as TXT"
                      className="p-1 px-2.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                    <button
                      onClick={clearSessionTranscript}
                      title="Clear session history"
                      className="p-1 px-2.5 rounded-lg text-[11px] font-medium bg-white dark:bg-rose-950/20 shadow-sm border border-slate-200/80 dark:border-rose-900/30 text-slate-500 dark:text-rose-400 hover:text-rose-600 hover:border-rose-200 dark:hover:text-rose-300 dark:hover:border-rose-900/65 hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Subtitle list scroll container */}
                <div 
                  ref={transcriptContainerRef}
                  className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar scroll-smooth"
                >
                  {liveState.turns.length > 0 && (
                    <div className="hidden md:grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-2 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-300 tracking-wider">
                      <div>CAPTURED ORIGINAL AUDIO</div>
                      <div>GEMINI SIMULTANEOUS INTERPRETATION</div>
                    </div>
                  )}

                  {liveState.turns.map((turn, idx) => (
                    <div 
                      key={idx} 
                      className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-slate-100/40 dark:border-slate-800/10 text-xs items-stretch"
                    >
                      <div className="p-3 rounded-xl border border-slate-200/50 dark:border-slate-850 bg-slate-100/30 dark:bg-slate-900/10 flex flex-col gap-1.5 justify-between">
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans text-sm font-medium">
                          {turn.originalText}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-300 font-mono border-t border-slate-100/50 dark:border-slate-800/20 pt-1.5 mt-0.5">
                          <span className="font-bold tracking-wider uppercase">NATIVE STREAM</span>
                          <span>
                            {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-emerald-500/12 dark:border-emerald-500/10 bg-emerald-500/[0.015] dark:bg-emerald-500/[0.01] flex flex-col gap-1.5 justify-between">
                        <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed font-sans text-sm font-semibold">
                          {turn.translatedText}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-emerald-600 dark:text-emerald-400/90 font-mono border-t border-emerald-500/5 dark:border-emerald-500/5 pt-1.5 mt-0.5">
                          <span className="font-bold tracking-wider uppercase">Interpreted ({liveTargetLang})</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 dark:text-slate-300 font-normal">
                              {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleSaveTurnSnippet(turn)}
                              title="Bookmark this translation snippet to Library"
                              className={`p-0.5 rounded transition-colors cursor-pointer ${
                                savedSnippetIds.has(`${turn.timestamp}`)
                                  ? "text-amber-500"
                                  : "text-slate-400 hover:text-amber-500"
                              }`}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${savedSnippetIds.has(`${turn.timestamp}`) ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(liveState.userTranscript || liveState.modelTranscript) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs items-stretch">
                      <div className="p-3 rounded-xl border border-dashed border-slate-300/85 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/5 flex flex-col gap-2 justify-between">
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-sans text-sm italic">
                          {liveState.userTranscript ? `"${liveState.userTranscript}"` : "Listening for active speech segments..."}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-300 font-mono border-t border-dashed border-slate-200/50 dark:border-slate-800/20 pt-1.5">
                          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            DETECTOR
                          </span>
                          {liveState.userTranscript && (
                            <span className="text-amber-500 font-bold tracking-widest animate-pulse">DECODING...</span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.015] dark:bg-emerald-500/[0.005] flex flex-col gap-2 justify-between">
                        <p className="text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed font-sans text-sm italic">
                          {liveState.modelTranscript ? `"${liveState.modelTranscript}"` : `Translating live to ${liveTargetLang}...`}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-emerald-500 font-mono border-t border-dashed border-emerald-500/10 pt-1.5">
                          <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            INTELLIGENCE
                          </span>
                          {liveState.modelTranscript && (
                            <span className="text-emerald-500 font-bold tracking-wide animate-pulse uppercase">TRANSLATING...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {liveState.turns.length === 0 && !liveState.userTranscript && !liveState.modelTranscript && (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 dark:text-slate-300">
                      <ScrollText className="w-9 h-9 opacity-40 mb-2 animate-pulse" style={{ animationDuration: '3s' }} />
                      <p className="text-xs font-semibold uppercase tracking-wider font-mono">Listening to active broadcast frequencies...</p>
                      <p className="text-[10px] opacity-75 mt-1 max-w-md">Captured audio captions & simultaneous translations will flow into this dual-channel display in real-time.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Tab View Switching: Explore View vs Library View */}
          {currentView === "explore" ? (
            <>
              {/* World Map Container */}
              <section className="w-full">
                <WorldMap
                  darkMode={darkMode}
                  onMapClick={handleMapLocationClick}
                  selectedProfile={selectedProfile}
                  loading={profileLoading}
                  selectedCoords={selectedCoords}
                  radiusKm={radiusKm}
                  setRadiusKm={setRadiusKm}
                  onRadiusChangeEnd={handleRadiusChangeEnd}
                />
              </section>

              {/* Radios Catalog Panel with Category Pills, Search, and Surprise Me */}
              <section className="flex-1">
                <StationList
                  currentCountryProfile={selectedProfile}
                  onSelectStation={handleSelectStation}
                  activeStation={activeStation}
                  isPlaying={isPlaying}
                  isProfileLoading={profileLoading}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </section>
            </>
          ) : (
            /* Saved Favorites and Playback History Library View */
            <section className="flex-1">
              <FavoritesLibrary
                favorites={favorites}
                recentlyPlayed={recentlyPlayed}
                savedTranscripts={savedTranscripts}
                activeStation={activeStation}
                isPlaying={isPlaying}
                onSelectStation={handleSelectStation}
                onToggleFavorite={toggleFavorite}
                onClearHistory={handleClearHistory}
                onDeleteTranscript={handleDeleteTranscript}
                userEmail={userEmail}
                onOpenRegister={() => setShowRegisterModal(true)}
                onOpenUpgrade={() => setShowPaywall(true)}
                onSelectStationByName={async (name) => {
                  const match = favorites.find(s => s.name.toLowerCase() === name.toLowerCase());
                  if (match) {
                    handleSelectStation(match);
                    return;
                  }
                  try {
                    const res = await fetch(`/api/stations/search?name=${encodeURIComponent(name)}&limit=1`);
                    const data = await res.json();
                    if (data && data.length > 0) {
                      handleSelectStation(data[0]);
                    }
                  } catch {}
                }}
              />
            </section>
          )}

        </div>
      </main>

      {/* Floating Sticky Audio Player Footer */}
      <footer className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl">
        <AudioPlayer
          station={activeStation}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          isFavorite={activeStation ? favorites.some((f) => f.stationuuid === activeStation.stationuuid) : false}
          onToggleFavorite={toggleFavorite}
          onOpenEqualizer={() => setShowAudioStudio(true)}
        />
      </footer>

      {/* User Registration & Cloud Sync Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        userEmail={userEmail}
        onUserRegistered={handleUserRegistered}
        favorites={favorites}
        savedTranscripts={savedTranscripts}
        subscription={subscription}
        onOpenUpgrade={() => setShowPaywall(true)}
      />

      {/* Monetization & AdMob Modals */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        subscription={subscription}
        onSubscriptionUpdated={(sub) => {
          setSubscription(sub);
          localStorage.setItem("wrt_subscription_tier", sub.tier);
          if (sub.token) localStorage.setItem("wrt_subscription_token", sub.token);
          if (sub.email) localStorage.setItem("wrt_user_email", sub.email);
          setShowPaywall(false);
        }}
      />

      <ManageSubscriptionModal
        isOpen={showManageSub}
        onClose={() => setShowManageSub(false)}
        subscription={subscription}
        onSubscriptionUpdated={(sub) => {
          setSubscription(sub);
          localStorage.setItem("wrt_subscription_tier", sub.tier);
          if (sub.token) localStorage.setItem("wrt_subscription_token", sub.token);
          if (sub.email) localStorage.setItem("wrt_user_email", sub.email);
        }}
        onOpenUpgrade={() => setShowPaywall(true)}
      />

      <InterstitialModal
        isOpen={showInterstitial}
        onClose={() => setShowInterstitial(false)}
        onUpgrade={() => {
          setShowInterstitial(false);
          setShowPaywall(true);
        }}
      />

      <RewardedAdModal
        isOpen={showRewardedModal}
        onClose={() => setShowRewardedModal(false)}
        onRewardUnlocked={(minutes) => {
          setTranslationSecondsLeft((prev) => prev + minutes * 60);
          setShowRewardedModal(false);
        }}
      />

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{saveToast}</span>
          <button
            onClick={() => {
              setCurrentView("library");
              setSaveToast(null);
            }}
            className="text-xs text-emerald-400 underline font-extrabold hover:text-emerald-300 ml-1 cursor-pointer"
          >
            Open Library
          </button>
        </div>
      )}

    </div>
  );
}

