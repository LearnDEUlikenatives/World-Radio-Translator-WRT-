import { useState, useEffect, useRef } from "react";
import { RadioStation } from "../types";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Disc3,
  Heart,
  Share2,
  Moon,
  AlertTriangle,
  CheckCheck,
  Clock,
  X
} from "lucide-react";
import Hls from "hls.js";
import { audioEngine } from "../services/audioEngine";

interface AudioPlayerProps {
  station: RadioStation | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (station: RadioStation) => void;
  onOpenEqualizer?: () => void;
}

export default function AudioPlayer({
  station,
  isPlaying,
  setIsPlaying,
  isFavorite = false,
  onToggleFavorite,
  onOpenEqualizer
}: AudioPlayerProps) {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Sleep Timer (in minutes: 0 = off, 15, 30, 45, 60)
  const [sleepMinutes, setSleepMinutes] = useState<number>(0);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number>(0);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  // Share & Report
  const [copiedShare, setCopiedShare] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const lastUrlRef = useRef<string>("");
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Attach audio element to AudioEngine for visualizer & DSP
  useEffect(() => {
    if (audioRef.current) {
      audioEngine.init(audioRef.current);
    }
  }, []);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepMinutes <= 0) {
      setSleepSecondsLeft(0);
      return;
    }

    setSleepSecondsLeft(sleepMinutes * 60);

    const interval = setInterval(() => {
      setSleepSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPlaying(false);
          setSleepMinutes(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepMinutes, setIsPlaying]);

  const targetUrl = station ? (station.url_resolved || station.url) : "";
  const proxiedUrl = targetUrl ? `/api/proxy-stream?url=${encodeURIComponent(targetUrl)}` : "";
  const isHls = Boolean(
    targetUrl.toLowerCase().includes(".m3u8") ||
    (station && station.url.toLowerCase().includes(".m3u8"))
  );

  // Synchronize audio stream play/pause when station or isPlaying changes
  useEffect(() => {
    if (!audioRef.current) return;

    if (!station || !targetUrl) {
      lastUrlRef.current = "";
      playPromiseRef.current = null;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      try {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      } catch (e) {}
      setIsPlaying(false);
      setLoading(false);
      setStreamError(null);
      return;
    }

    let isCancelled = false;

    if (isPlaying) {
      const startPlayback = async () => {
        // Resume AudioEngine context
        await audioEngine.resume();

        if (isCancelled || !audioRef.current) return;

        const currentActiveUrl = isHls ? targetUrl : proxiedUrl;
        const isNewSource = lastUrlRef.current !== currentActiveUrl;
        if (isNewSource) {
          lastUrlRef.current = currentActiveUrl;
          setStreamError(null);
          setLoading(true);

          if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
          }

          try {
            audioRef.current.pause();
          } catch (e) {}

          if (isHls) {
            if (audioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
              audioRef.current.src = targetUrl;
              audioRef.current.load();
            } else if (Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferSize: 0,
                maxBufferLength: 1.5,
                liveDurationInfinity: true,
              });
              hlsRef.current = hls;

              hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                  console.warn(`HLS.js fatal error: ${data.details}. Attempting recovery...`);
                  if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    try {
                      hls.destroy();
                      hlsRef.current = null;
                      if (audioRef.current) {
                        audioRef.current.src = proxiedUrl;
                        audioRef.current.play().catch(() => setErrorState());
                      }
                    } catch (err) {
                      setErrorState();
                    }
                  } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                  } else {
                    setErrorState();
                  }
                }
              });

              hls.loadSource(targetUrl);
              hls.attachMedia(audioRef.current);
            } else {
              audioRef.current.src = proxiedUrl;
              audioRef.current.load();
            }
          } else {
            audioRef.current.src = proxiedUrl;
            audioRef.current.load();
          }
        }

        setLoading(true);
        try {
          const playPromise = audioRef.current.play();
          playPromiseRef.current = playPromise;

          await playPromise;

          if (isCancelled) return;
          if (playPromiseRef.current === playPromise) {
            setLoading(false);
            setStreamError(null);
          }
        } catch (err: any) {
          if (isCancelled) return;
          if (err.name === "AbortError" || err.message?.includes("interrupted")) {
            return;
          }

          // If primary stream failed, attempt alternative stream URL before failing
          const altUrl = targetUrl === station.url_resolved ? station.url : station.url_resolved;
          if (altUrl && altUrl !== targetUrl && audioRef.current) {
            console.warn(`[AudioPlayer] Primary source failed for "${station.name}", trying alternative: ${altUrl}`);
            try {
              const altProxied = `/api/proxy-stream?url=${encodeURIComponent(altUrl)}`;
              audioRef.current.src = altProxied;
              audioRef.current.load();
              await audioRef.current.play();
              if (!isCancelled) {
                setLoading(false);
                setStreamError(null);
              }
              return;
            } catch (fallbackErr: any) {
              if (fallbackErr.name === "AbortError") return;
            }
          }

          // If still failing and target is HTTPS, try direct HTTPS connection
          if (targetUrl.startsWith("https://") && audioRef.current) {
            console.warn(`[AudioPlayer] Proxied stream failed for "${station.name}", trying direct HTTPS...`);
            try {
              audioRef.current.src = targetUrl;
              audioRef.current.load();
              await audioRef.current.play();
              if (!isCancelled) {
                setLoading(false);
                setStreamError(null);
              }
              return;
            } catch (directErr: any) {
              if (directErr.name === "AbortError") return;
            }
          }

          console.warn(`[AudioPlayer] Stream unplayable for "${station.name}":`, err?.message || err);
          setErrorState();
        }
      };

      startPlayback();
    } else {
      setLoading(false);
      playPromiseRef.current = null;
      lastUrlRef.current = "";
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      try {
        audioRef.current.pause();
      } catch (e) {}
    }

    return () => {
      isCancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [station, isPlaying]);

  // Synchronize volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const setErrorState = () => {
    setLoading(false);
    setIsPlaying(false);
    setStreamError("Broadcast temporarily unavailable from this radio station. Please try another frequency.");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleShareStation = () => {
    if (!station) return;
    const url = `${window.location.origin}/?station=${encodeURIComponent(station.name)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  };

  const handleReportBroken = async () => {
    if (!station) return;
    setIsReporting(true);
    try {
      const res = await fetch("/api/stations/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationuuid: station.stationuuid,
          stationName: station.name,
          streamUrl: station.url_resolved || station.url
        })
      });
      const data = await res.json();
      setReportSuccess(data.message || "Report submitted successfully!");
      setTimeout(() => {
        setReportSuccess(null);
        setShowReportModal(false);
      }, 2500);
    } catch {
      setReportSuccess("Report submitted. Thank you!");
      setTimeout(() => {
        setReportSuccess(null);
        setShowReportModal(false);
      }, 2500);
    } finally {
      setIsReporting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/60 dark:border-slate-800/80 py-3 px-4 md:px-6 flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between shadow-2xl relative min-h-[75px]">
      
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onCanPlay={() => {
          setLoading(false);
          setStreamError(null);
        }}
        onWaiting={() => setLoading(true)}
        onError={() => {
          if (!isPlaying || !station || !audioRef.current) return;
          const error = audioRef.current.error;
          if (!error || error.code === 1) return;

          const currentSrc = audioRef.current.src || "";
          if (
            !currentSrc ||
            currentSrc === window.location.href ||
            !currentSrc.startsWith("http")
          ) {
            return;
          }

          const altUrl = targetUrl === station.url_resolved ? station.url : station.url_resolved;
          if (altUrl && !currentSrc.includes(encodeURIComponent(altUrl))) {
            const fallbackProxied = `/api/proxy-stream?url=${encodeURIComponent(altUrl)}`;
            audioRef.current.src = fallbackProxied;
            audioRef.current.play().catch(() => setErrorState());
          } else if (targetUrl.startsWith("https://") && currentSrc.includes("/api/proxy-stream")) {
            audioRef.current.src = targetUrl;
            audioRef.current.play().catch(() => setErrorState());
          } else {
            setErrorState();
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Station Information & Quick Actions */}
      <div className="flex items-center gap-3 w-full md:w-5/12 min-w-0">
        {station ? (
          <>
            <div className="relative flex-shrink-0">
              <div className={`w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden ${isPlaying ? "animate-pulse" : ""}`}>
                {station.favicon ? (
                  <img
                    src={station.favicon}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const tgt = e.target as HTMLImageElement;
                      tgt.style.display = "none";
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Radio className="w-5 h-5 text-emerald-500" />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                  {station.name}
                </p>
                {station.codec && (
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0">
                    {station.codec} {station.bitrate ? `${station.bitrate}k` : ""}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {station.country || "Worldwide"} • {station.language || "Native Audio"}
                {station.currentShow ? ` • ${station.currentShow}` : ""}
              </p>
            </div>

            {/* Quick action toolbar buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(station)}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    isFavorite
                      ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
                      : "text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              )}

              <button
                onClick={handleShareStation}
                title="Share station link"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {copiedShare ? (
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                title="Report broken or offline stream"
                className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-11 h-11 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center flex-shrink-0">
              <Disc3 className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No station active</p>
              <p className="text-[11px] text-slate-400">Click any country or station above to tune in</p>
            </div>
          </div>
        )}
      </div>

      {/* Primary Play/Pause Controls */}
      <div className="flex items-center gap-3 justify-center w-full md:w-3/12">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={!station}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all shadow-md cursor-pointer ${
            !station
              ? "bg-slate-300 dark:bg-slate-800 cursor-not-allowed opacity-60"
              : isPlaying
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 active:scale-95"
              : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 active:scale-95"
          }`}
          title={!station ? "No station loaded" : isPlaying ? "Pause broadcast" : "Play broadcast"}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current translate-x-[1px]" />
          )}
        </button>
      </div>

      {/* Volume & Sleep Timer Controls */}
      <div className="flex items-center justify-end gap-3 w-full md:w-4/12 relative">
        {/* Sleep Timer button & menu */}
        <div className="relative">
          <button
            onClick={() => setShowSleepMenu(!showSleepMenu)}
            title="Sleep timer"
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              sleepMinutes > 0
                ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Moon className="w-4 h-4" />
            {sleepMinutes > 0 && (
              <span className="font-mono text-[10px]">
                {formatTime(sleepSecondsLeft)}
              </span>
            )}
          </button>

          {showSleepMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                <span>Sleep Timer</span>
                <Clock className="w-3 h-3" />
              </div>
              {[
                { label: "Off", value: 0 },
                { label: "15 minutes", value: 15 },
                { label: "30 minutes", value: 30 },
                { label: "45 minutes", value: 45 },
                { label: "60 minutes", value: 60 }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSleepMinutes(opt.value);
                    setShowSleepMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-left font-medium transition-colors cursor-pointer ${
                    sleepMinutes === opt.value
                      ? "bg-emerald-500 text-white font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2 text-slate-500">
          <button
            onClick={toggleMute}
            className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
            title={isMuted || volume === 0 ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-20 md:w-24 accent-emerald-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
          />
        </div>
      </div>

      {/* Broken Stream Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-bold">Report Broken Stream</h4>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Is <strong>{station?.name}</strong> silent or failing to connect? Submit a report so our automated stream checker can verify alternate relay mirrors.
            </p>

            {reportSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400">
                {reportSuccess}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReportBroken}
                  disabled={isReporting}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                >
                  {isReporting ? "Sending..." : "Submit Report"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

