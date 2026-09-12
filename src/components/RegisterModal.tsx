import React, { useState } from "react";
import { X, UserPlus, LogIn, Sparkles, CheckCircle2, Shield, Heart, FileText, Crown, RefreshCw, Mail, ArrowRight } from "lucide-react";
import { RadioStation, SavedTranscriptItem, SubscriptionState } from "../types";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onUserRegistered: (email: string, name?: string) => void;
  favorites: RadioStation[];
  savedTranscripts: SavedTranscriptItem[];
  subscription: SubscriptionState;
  onOpenUpgrade: () => void;
}

export default function RegisterModal({
  isOpen,
  onClose,
  userEmail,
  onUserRegistered,
  favorites,
  savedTranscripts,
  subscription,
  onOpenUpgrade
}: RegisterModalProps) {
  const [email, setEmail] = useState(userEmail || "");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"register" | "signin">("register");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            name: name.trim(),
            favorites,
            transcripts: savedTranscripts
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("wrt_user_email", cleanEmail);
          if (name.trim()) localStorage.setItem("wrt_user_name", name.trim());
          onUserRegistered(cleanEmail, name.trim());
          setSuccessMessage(data.message || "Account registered successfully!");
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMessage(data.message || "Failed to register account.");
        }
      } else {
        // Sign in / sync existing account
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            favorites,
            transcripts: savedTranscripts
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("wrt_user_email", cleanEmail);
          onUserRegistered(cleanEmail);
          setSuccessMessage(`Welcome back! Data synced for ${cleanEmail}.`);
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMessage(data.message || "Failed to sign in.");
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("wrt_user_email");
    localStorage.removeItem("wrt_user_name");
    onUserRegistered("");
    setSuccessMessage("Signed out.");
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const isLoggedIn = Boolean(userEmail);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                {isLoggedIn ? "Your Account" : mode === "register" ? "Create Free Account" : "Sign In"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isLoggedIn ? "Sync favorites & translations across devices" : "Save your stations & translations upfront for free"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          
          {isLoggedIn ? (
            /* Logged in state */
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userEmail}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      subscription.tier === "vip" 
                        ? "bg-amber-500 text-slate-950" 
                        : subscription.tier === "pro" 
                        ? "bg-emerald-500 text-white" 
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}>
                      {subscription.tier} Tier
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Cloud Backup & Sync Active
                  </p>
                </div>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{favorites.length}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Saved Stations</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{savedTranscripts.length}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Saved Transcripts</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Promo if on free */}
              {subscription.tier === "free" && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Want 24/7 Unlimited Translation?</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Upgrade for ad-free listening & full DSP.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpgrade();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer transition-all flex items-center gap-1 flex-shrink-0"
                  >
                    <span>Upgrade</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                >
                  Sign Out
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Feature bullets */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Free forever: Save your favorite radio stations & transcripts</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>Daily live AI speech-to-speech translation included</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>Opt for 24/7 unlimited translation subscription anytime</span>
                </div>
              </div>

              {/* Tabs: Register vs Sign In */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Create Free Account
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === "signin"
                      ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Sign In / Restore
                </button>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Name Input (Optional in register mode) */}
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Listener Name"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              )}

              {/* Feedback messages */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 mt-1"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : mode === "register" ? (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Free Account</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In & Sync Data</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
