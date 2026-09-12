import React, { useState } from "react";
import { RadioStation, RecentlyPlayedItem, SavedTranscriptItem } from "../types";
import {
  Heart,
  Clock,
  Play,
  Pause,
  Trash2,
  Share2,
  Search,
  Radio,
  WifiOff,
  Bookmark,
  FileText,
  Download,
  Copy,
  Check,
  Languages,
  ChevronDown,
  ChevronUp,
  RadioTower,
  Calendar,
  UserPlus,
  CheckCircle2,
  Cloud
} from "lucide-react";

interface FavoritesLibraryProps {
  favorites: RadioStation[];
  recentlyPlayed: RecentlyPlayedItem[];
  savedTranscripts: SavedTranscriptItem[];
  activeStation: RadioStation | null;
  isPlaying: boolean;
  onSelectStation: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  onClearHistory: () => void;
  onDeleteTranscript: (id: string) => void;
  onSelectStationByName?: (stationName: string) => void;
  userEmail?: string;
  onOpenRegister?: () => void;
  onOpenUpgrade?: () => void;
}

export default function FavoritesLibrary({
  favorites,
  recentlyPlayed,
  savedTranscripts,
  activeStation,
  isPlaying,
  onSelectStation,
  onToggleFavorite,
  onClearHistory,
  onDeleteTranscript,
  onSelectStationByName,
  userEmail,
  onOpenRegister,
  onOpenUpgrade
}: FavoritesLibraryProps) {
  const [activeTab, setActiveTab] = useState<"favorites" | "history" | "transcripts">("favorites");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTranscriptIds, setExpandedTranscriptIds] = useState<Set<string>>(new Set());

  const toggleExpandTranscript = (id: string) => {
    setExpandedTranscriptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleShareStation = (station: RadioStation, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/?station=${encodeURIComponent(station.name)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(station.stationuuid);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleCopyTranscript = (item: SavedTranscriptItem, e: React.MouseEvent) => {
    e.stopPropagation();
    let text = `=== Saved Transcript: ${item.stationName} ===\n`;
    text += `Target Language: ${item.targetLang}\n`;
    text += `Saved on: ${new Date(item.timestamp).toLocaleString()}\n\n`;

    if (item.turns && item.turns.length > 0) {
      item.turns.forEach((turn, idx) => {
        const timeStr = new Date(turn.timestamp).toLocaleTimeString();
        text += `[#${idx + 1} - ${timeStr}]\n`;
        text += `Original: ${turn.originalText}\n`;
        text += `Translation (${item.targetLang}): ${turn.translatedText}\n\n`;
      });
    } else {
      if (item.originalText) text += `Original: ${item.originalText}\n`;
      if (item.translatedText) text += `Translation (${item.targetLang}): ${item.translatedText}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDownloadTranscript = (item: SavedTranscriptItem, e: React.MouseEvent) => {
    e.stopPropagation();
    let text = `=== Saved Transcript: ${item.stationName} ===\n`;
    text += `Target Language: ${item.targetLang}\n`;
    text += `Saved on: ${new Date(item.timestamp).toLocaleString()}\n\n`;

    if (item.turns && item.turns.length > 0) {
      item.turns.forEach((turn, idx) => {
        const timeStr = new Date(turn.timestamp).toLocaleTimeString();
        text += `[#${idx + 1} - ${timeStr}]\n`;
        text += `Original: ${turn.originalText}\n`;
        text += `Translation (${item.targetLang}): ${turn.translatedText}\n\n`;
      });
    } else {
      if (item.originalText) text += `Original: ${item.originalText}\n`;
      if (item.translatedText) text += `Translation (${item.targetLang}): ${item.translatedText}\n`;
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeName = item.stationName.replace(/[^a-zA-Z0-9_-]/g, "_");
    link.download = `transcript_${safeName}_${new Date(item.timestamp).toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredFavorites = favorites.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.country && s.country.toLowerCase().includes(q)) ||
      (s.tags && s.tags.toLowerCase().includes(q))
    );
  });

  const filteredHistory = recentlyPlayed.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.station.name.toLowerCase().includes(q) ||
      (item.station.country && item.station.country.toLowerCase().includes(q))
    );
  });

  const filteredTranscripts = savedTranscripts.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.stationName.toLowerCase().includes(q) ||
      item.targetLang.toLowerCase().includes(q) ||
      (item.originalText && item.originalText.toLowerCase().includes(q)) ||
      (item.translatedText && item.translatedText.toLowerCase().includes(q)) ||
      (item.turns && item.turns.some(t => t.originalText.toLowerCase().includes(q) || t.translatedText.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Upfront Cloud Backup & Registration Status Banner */}
      {userEmail ? (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 min-w-0">
            <Cloud className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="truncate">
              <span className="font-bold">Cloud Sync Active</span> for <span className="font-mono font-semibold">{userEmail}</span>. All saved stations & translation transcripts are backed up.
            </span>
          </div>
          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] cursor-pointer flex-shrink-0 transition-colors"
            >
              Account Details
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Register Free Upfront to Backup Your Library
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Save your favorite stations & live translation transcripts forever across all your devices.
              </p>
            </div>
          </div>
          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Free Upfront</span>
            </button>
          )}
        </div>
      )}

      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "favorites"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Saved Stations ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("transcripts")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "transcripts"
                ? "bg-amber-500 text-slate-950 shadow-sm font-extrabold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Saved Translations ({savedTranscripts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === "history"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recently Played ({recentlyPlayed.length})</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === "transcripts"
                  ? "Search saved transcripts..."
                  : "Search stations..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
            />
          </div>

          {activeTab === "history" && recentlyPlayed.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear playback history"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Offline Storage Notice */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <WifiOff className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
        <span>
          {activeTab === "transcripts"
            ? "Your saved AI translations and transcripts are stored securely for instant offline review, searching, and TXT export."
            : "Favorites metadata and history are cached locally in offline storage. Streaming live audio requires an active internet connection."}
        </span>
      </div>

      {/* TAB 1: SAVED TRANSLATIONS */}
      {activeTab === "transcripts" && (
        filteredTranscripts.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bookmark className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No saved translation transcripts yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              When listening to international broadcasts with real-time translation enabled, click the <strong>"Save to Library"</strong> button or the bookmark icon on any translation card to preserve full conversations, news reports, and audio transcripts here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTranscripts.map((item) => {
              const isExpanded = expandedTranscriptIds.has(item.id);
              const turnCount = item.turns ? item.turns.length : 1;
              const dateDisplay = new Date(item.timestamp).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric"
              });
              const timeDisplay = new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  {/* Card Header Bar */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-150 dark:border-slate-800/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">
                        <Bookmark className="w-4 h-4 fill-current" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {item.stationName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            → {item.targetLang}
                          </span>
                          {item.isSnippet && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              Snippet
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{item.stationCountry || "International"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {dateDisplay} at {timeDisplay}
                          </span>
                          <span>•</span>
                          <span>{turnCount} {turnCount === 1 ? "turn" : "turns"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                      {onSelectStationByName && (
                        <button
                          onClick={() => onSelectStationByName(item.stationName)}
                          title="Tune to this radio station"
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RadioTower className="w-3 h-3" />
                          <span>Tune In</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => handleCopyTranscript(item, e)}
                        title="Copy full transcript"
                        className="p-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
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
                        onClick={(e) => handleDownloadTranscript(item, e)}
                        title="Download transcript as TXT"
                        className="p-1.5 px-2.5 rounded-lg text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export</span>
                      </button>

                      <button
                        onClick={() => onDeleteTranscript(item.id)}
                        title="Delete saved transcript"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleExpandTranscript(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse view" : "Expand view"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Transcript Content */}
                  <div className="p-4 flex flex-col gap-3">
                    {/* If multiple turns exist */}
                    {item.turns && item.turns.length > 0 ? (
                      <div className={`flex flex-col gap-3 ${!isExpanded && item.turns.length > 2 ? "max-h-56 overflow-hidden relative" : ""}`}>
                        {item.turns.map((turn, tIdx) => (
                          <div
                            key={tIdx}
                            className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/40"
                          >
                            <div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-300 font-bold uppercase mb-1 flex items-center justify-between">
                                <span>Captured Native Stream</span>
                                <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium text-xs sm:text-sm">
                                {turn.originalText}
                              </p>
                            </div>

                            <div className="border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-slate-800/60 pt-2 md:pt-0 md:pl-3">
                              <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1 flex items-center justify-between">
                                <span>Interpreted ({item.targetLang})</span>
                              </div>
                              <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed font-sans font-semibold text-xs sm:text-sm">
                                {turn.translatedText}
                              </p>
                            </div>
                          </div>
                        ))}

                        {!isExpanded && item.turns.length > 2 && (
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent flex items-end justify-center pb-1">
                            <button
                              onClick={() => toggleExpandTranscript(item.id)}
                              className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
                            >
                              Show all {item.turns.length} turns
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Single text fallback */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800/40">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 dark:text-slate-300 font-bold uppercase mb-1">
                            Captured Native Stream
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-sans font-medium text-sm">
                            {item.originalText || "No original text saved."}
                          </p>
                        </div>
                        <div className="border-t md:border-t-0 md:border-l border-slate-200/60 dark:border-slate-800/60 pt-2 md:pt-0 md:pl-3">
                          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">
                            Interpreted ({item.targetLang})
                          </div>
                          <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed font-sans font-semibold text-sm">
                            {item.translatedText || "No translation text saved."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 2: SAVED FAVORITES */}
      {activeTab === "favorites" && (
        filteredFavorites.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <Heart className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No favorite stations yet</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Click the heart icon on any station card while exploring the globe or station directory to save it here for quick access!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFavorites.map((station) => {
              const isActive = activeStation?.stationuuid === station.stationuuid;
              return (
                <div
                  key={station.stationuuid}
                  onClick={() => onSelectStation(station)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}>
                      {isActive && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {station.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {station.country || "International"} • {station.language || "Unknown"}
                      </p>
                      {station.codec && (
                        <span className="text-[9px] font-mono text-slate-400 uppercase">
                          {station.codec} {station.bitrate ? `• ${station.bitrate}kbps` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleShareStation(station, e)}
                      title="Share station"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(station);
                      }}
                      title="Remove from favorites"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* TAB 3: RECENTLY PLAYED */}
      {activeTab === "history" && (
        filteredHistory.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center gap-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No playback history</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              Stations you tune into will automatically be recorded here so you never lose a great broadcast.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredHistory.map((item) => {
              const station = item.station;
              const isActive = activeStation?.stationuuid === station.stationuuid;
              const isFav = favorites.some((f) => f.stationuuid === station.stationuuid);
              return (
                <div
                  key={`${station.stationuuid}-${item.timestamp}`}
                  onClick={() => onSelectStation(station)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-emerald-500/10 border-emerald-500/60 ring-2 ring-emerald-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}>
                      {isActive && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {station.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {station.country || "International"} • Tuned in {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(station);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-rose-500" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
