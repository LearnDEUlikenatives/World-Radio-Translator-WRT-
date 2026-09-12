import React, { useState, useEffect } from "react";
import { X, Sparkles, Volume2, ShieldCheck, ArrowRight } from "lucide-react";

interface InterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function InterstitialModal({
  isOpen,
  onClose,
  onUpgrade
}: InterstitialModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Top bar with AdMob indicator & Skip countdown */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
              Ad
            </span>
            <span className="text-xs text-slate-400 font-medium">Google AdMob Interstitial</span>
          </div>

          <div className="flex items-center gap-2">
            {secondsRemaining > 0 ? (
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                Skip in {secondsRemaining}s
              </span>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full border border-slate-600 transition-all cursor-pointer"
              >
                <span>Skip Ad</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Ad Body / Creative */}
        <div className="p-6 flex flex-col items-center text-center gap-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Volume2 className="w-8 h-8 text-white" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-sm">
            <span className="text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
              Google Cloud Audio AI
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Real-Time Cross-Lingual Broadcast Streaming
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Experience zero-latency voice interpretation powered by Google Gemini multimodal models. Connect with cultures worldwide without language barriers.
            </p>
          </div>

          {/* Ad feature highlights */}
          <div className="w-full grid grid-cols-2 gap-2 text-left bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>30+ Live Languages</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Low Latency Audio DSP</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Global Radio Index</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Crystal Clear Streams</span>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Remove ads forever with Pro</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {secondsRemaining === 0 && (
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
              >
                Return to Radio
              </button>
            )}

            <button
              onClick={() => {
                window.open("https://cloud.google.com/vertex-ai", "_blank");
                if (secondsRemaining === 0) onClose();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>Explore Tech</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
