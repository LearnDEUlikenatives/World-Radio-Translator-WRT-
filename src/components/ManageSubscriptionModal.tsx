import React, { useState } from "react";
import { SubscriptionState } from "../types";
import { X, Crown, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Mail } from "lucide-react";
import { apiFetch } from "../lib/api";

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onSubscriptionUpdated: (updated: SubscriptionState) => void;
  onOpenUpgrade: () => void;
}

export default function ManageSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSubscriptionUpdated,
  onOpenUpgrade
}: ManageSubscriptionModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const userEmail = subscription.email || localStorage.getItem("wrt_user_email") || "";

  if (!isOpen) return null;

  const handleRestorePurchase = async () => {
    setIsVerifying(true);
    setNotice(null);
    try {
      const savedToken = localStorage.getItem("wrt_subscription_token") || subscription.token;
      
      // 1. Try restoring via token first
      let restored = false;
      if (savedToken) {
        const res = await apiFetch("/api/subscription/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: savedToken })
        });
        const data = await res.json();
        if (data.active) {
          onSubscriptionUpdated({
            ...subscription,
            tier: data.tier,
            token: data.token,
            email: data.email || userEmail
          });
          setNotice(`Purchases restored! Active license found for tier: ${data.tier.toUpperCase()}`);
          restored = true;
        }
      }

      // 2. If token restore didn't find active sub, try lookup by registered email
      if (!restored && userEmail) {
        const emailRes = await apiFetch("/api/subscription/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail })
        });
        const emailData = await emailRes.json();
        if (emailData.active) {
          onSubscriptionUpdated({
            ...subscription,
            tier: emailData.tier,
            token: emailData.token,
            email: emailData.email,
            validUntil: emailData.validUntil
          });
          localStorage.setItem("wrt_subscription_tier", emailData.tier);
          if (emailData.token) localStorage.setItem("wrt_subscription_token", emailData.token);
          setNotice(`Active ${emailData.tier.toUpperCase()} subscription retrieved for ${emailData.email}!`);
          restored = true;
        }
      }

      if (!restored) {
        setNotice("No active subscription found. You are currently on the Free Airwaves plan.");
      }
    } catch {
      setNotice("Failed to reach license verification server.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelAutoRenew = () => {
    onSubscriptionUpdated({
      ...subscription,
      autoRenew: false
    });
    setNotice("Auto-renewal has been cancelled. Your benefits remain active until the end of the billing period.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Manage Membership</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {/* Current Status Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase font-mono">Current Plan</span>
              <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                subscription.tier === "vip"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : subscription.tier === "pro"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-300"
              }`}>
                {subscription.tier === "vip" ? "Lifetime VIP" : subscription.tier === "pro" ? "Pro Member" : "Free Airwaves"}
              </span>
            </div>

            {userEmail && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                <span className="text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>Registered Email</span>
                </span>
                <span className="font-semibold text-emerald-400 font-mono text-[11px] truncate max-w-[180px]">
                  {userEmail}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Ad-Free Experience</span>
              <span className="font-semibold text-white">
                {subscription.tier !== "free" ? "Active (No Ads)" : "Disabled (Supported by AdMob)"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Live Translation</span>
              <span className="font-semibold text-white">
                {subscription.tier !== "free" ? "Unlimited 24/7" : "5 mins / day or Rewarded Boost"}
              </span>
            </div>

            {subscription.validUntil && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Renewal Date</span>
                <span className="font-semibold text-white">
                  {new Date(subscription.validUntil).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription.token && (
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <span>License Key</span>
                <span className="truncate max-w-[160px]">{subscription.token}</span>
              </div>
            )}
          </div>

          {/* Notice Banner */}
          {notice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{notice}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {subscription.tier === "free" ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpgrade();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro / VIP</span>
              </button>
            ) : subscription.tier === "pro" ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUpgrade();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade to Lifetime VIP ($79.99)</span>
                </button>
                {subscription.autoRenew && (
                  <button
                    onClick={handleCancelAutoRenew}
                    className="w-full py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    Cancel Auto-Renewal
                  </button>
                )}
              </>
            ) : null}

            <button
              onClick={handleRestorePurchase}
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
              <span>Restore Purchases</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
