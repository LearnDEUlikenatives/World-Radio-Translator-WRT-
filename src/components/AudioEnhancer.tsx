import React from "react";
import { AudioEnhancements, SubscriptionTier } from "../types";
import { Sliders, RotateCcw, Volume2, Sparkles, Mic2 } from "lucide-react";

interface AudioEnhancerProps {
  enhancements: AudioEnhancements;
  onChange: (updated: AudioEnhancements) => void;
  tier: SubscriptionTier;
  onOpenUpgrade: () => void;
}

export default function AudioEnhancer({
  enhancements,
  onChange,
  tier,
  onOpenUpgrade
}: AudioEnhancerProps) {
  const isPro = tier === "pro" || tier === "vip";

  const handleSlider = (key: keyof AudioEnhancements, value: number) => {
    onChange({
      ...enhancements,
      [key]: value
    });
  };

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case "flat":
        onChange({ bassBoost: 50, treble: 50, vocalClarity: 50 });
        break;
      case "bass":
        onChange({ bassBoost: 80, treble: 45, vocalClarity: 50 });
        break;
      case "vocal":
        onChange({ bassBoost: 40, treble: 60, vocalClarity: 85 });
        break;
      case "bright":
        onChange({ bassBoost: 50, treble: 80, vocalClarity: 65 });
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm flex flex-col gap-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Acoustic DSP Equalizer
          </h3>
          {isPro && (
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Studio Grade
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => applyPreset("flat")}
            className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset to flat response"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        <button
          onClick={() => applyPreset("flat")}
          className="px-2 py-1.5 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-center"
        >
          Flat
        </button>
        <button
          onClick={() => applyPreset("bass")}
          className="px-2 py-1.5 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-center"
        >
          Bass Boost
        </button>
        <button
          onClick={() => applyPreset("vocal")}
          className="px-2 py-1.5 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-center"
        >
          Vocal Clarity
        </button>
        <button
          onClick={() => applyPreset("bright")}
          className="px-2 py-1.5 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all text-center"
        >
          Bright Treble
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="flex flex-col gap-3 pt-1">
        {/* Bass Boost */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Deep Bass Shelf (120 Hz)</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {enhancements.bassBoost > 50 ? `+${((enhancements.bassBoost - 50) * 0.28).toFixed(1)} dB` : enhancements.bassBoost < 50 ? `${((enhancements.bassBoost - 50) * 0.28).toFixed(1)} dB` : "0.0 dB"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancements.bassBoost}
            onChange={(e) => handleSlider("bassBoost", parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        {/* Treble Balance */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>High Air Treble (3.5 kHz)</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {enhancements.treble > 50 ? `+${((enhancements.treble - 50) * 0.24).toFixed(1)} dB` : enhancements.treble < 50 ? `${((enhancements.treble - 50) * 0.24).toFixed(1)} dB` : "0.0 dB"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancements.treble}
            onChange={(e) => handleSlider("treble", parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>

        {/* Vocal Clarity */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Mic2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Vocal Formant Clarity (2 kHz Peaking)</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {enhancements.vocalClarity > 50 ? `+${((enhancements.vocalClarity - 50) * 0.2).toFixed(1)} dB` : enhancements.vocalClarity < 50 ? `${((enhancements.vocalClarity - 50) * 0.2).toFixed(1)} dB` : "0.0 dB"}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={enhancements.vocalClarity}
            onChange={(e) => handleSlider("vocalClarity", parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
