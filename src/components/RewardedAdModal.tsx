import React, { useState, useEffect } from "react";
import { Gift, Play, CheckCircle2, X, Sparkles, Trophy } from "lucide-react";

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardUnlocked: (minutesGranted: number) => void;
}

export default function RewardedAdModal({
  isOpen,
  onClose,
  onRewardUnlocked
}: RewardedAdModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const totalSeconds = 15; // Fast 15s simulation for great user experience

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setProgress(0);
      setIsCompleted(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsCompleted(true);
            setIsPlaying(false);
            return 100;
          }
          return prev + (100 / (totalSeconds * 10));
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isCompleted]);

  const handleStartAd = () => {
    setIsPlaying(true);
    setProgress(0);
  };

  const handleClaim = () => {
    onRewardUnlocked(30); // 30 minutes rewarded boost
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Rewarded Video Ad</h3>
              <p className="text-[10px] text-slate-400 font-mono">Google AdMob Rewarded Placement</p>
            </div>
          </div>

          {!isPlaying && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center gap-4">
          {!isPlaying && !isCompleted && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-white">Unlock 30 Minutes of Free Translation</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                  Watch a short sponsor video from Google AdMob to immediately receive 30 minutes of uninterrupted Gemini Live broadcast translation!
                </p>
              </div>

              <div className="w-full bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50 flex items-center justify-around text-xs">
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-mono">Duration</span>
                  <span className="font-bold text-white">15 Seconds</span>
                </div>
                <div className="h-6 w-px bg-slate-700" />
                <div className="flex flex-col items-center">
                  <span className="text-slate-400 text-[10px] uppercase font-mono">Reward</span>
                  <span className="font-bold text-emerald-400">+30 Min Boost</span>
                </div>
              </div>

              <button
                onClick={handleStartAd}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer mt-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Watch Video Now</span>
              </button>
            </>
          )}

          {isPlaying && !isCompleted && (
            <div className="w-full flex flex-col items-center gap-5 py-4">
              <div className="w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-emerald-950/30 to-slate-950 pointer-events-none" />
                <Sparkles className="w-10 h-10 text-emerald-400 mb-2 animate-bounce" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-widest">
                  Google Gemini Live Translate
                </span>
                <span className="text-sm font-semibold text-slate-200 mt-1">
                  Connecting Cultures Across 30+ Languages
                </span>

                {/* Live progress indicator inside video */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Ad playing...</span>
                  <span>{Math.ceil(totalSeconds * (1 - progress / 100))}s remaining</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full flex flex-col gap-1.5">
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-100 rounded-full"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Please keep this window open to earn your reward</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="w-full flex flex-col items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-scale">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-bold text-white">Reward Unlocked!</h4>
                <p className="text-xs text-slate-300 max-w-xs">
                  You have successfully earned <strong className="text-emerald-400">30 minutes of unlimited AI live translation</strong>. Enjoy listening and learning!
                </p>
              </div>

              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 cursor-pointer mt-2"
              >
                Claim & Start Listening
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
