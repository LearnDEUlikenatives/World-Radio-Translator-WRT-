import React, { useState } from "react";
import { SubscriptionPlan, SubscriptionState, BillingCycle } from "../types";
import {
  Check,
  Sparkles,
  X,
  CreditCard,
  Zap,
  Crown,
  Tag,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Mail,
  AlertCircle
} from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onSubscriptionUpdated: (updated: SubscriptionState) => void;
}

export default function PaywallModal({
  isOpen,
  onClose,
  subscription,
  onSubscriptionUpdated
}: PaywallModalProps) {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>("annual");
  const [selectedTier, setSelectedTier] = useState<"pro" | "vip">("pro");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discountPercent?: number; message?: string } | null>(null);
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // Email registration state
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem("wrt_user_email") || subscription.email || "";
  });
  const [emailError, setEmailError] = useState<string | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");

  if (!isOpen) return null;

  // Calculate prices
  let basePrice = selectedTier === "vip" ? 79.99 : selectedCycle === "annual" ? 39.99 : 4.99;
  let finalPrice = basePrice;
  if (promoResult?.valid && promoResult.discountPercent) {
    finalPrice = Number((basePrice * (1 - promoResult.discountPercent / 100)).toFixed(2));
  }

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setIsVerifyingPromo(true);
    try {
      const res = await fetch("/api/subscription/promo-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoResult({ valid: true, discountPercent: data.discountPercent, message: data.message });
      } else {
        setPromoResult({ valid: false, message: data.message || "Invalid promo code" });
      }
    } catch {
      setPromoResult({ valid: false, message: "Network error verifying code" });
    } finally {
      setIsVerifyingPromo(false);
    }
  };

  const handleCheckout = async (paymentMethod: "card" | "google_pay" | "apple_pay" = "card") => {
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setEmailError("Please enter a valid email address to register your license.");
      return;
    }
    setEmailError(null);

    setIsCheckingOut(true);
    try {
      const planId = selectedTier === "vip" ? "plan_vip_lifetime" : selectedCycle === "annual" ? "plan_pro_annual" : "plan_pro_monthly";
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          paymentMethod,
          promoCode: promoResult?.valid ? promoCode : undefined,
          email: cleanEmail
        })
      });

      const data = await res.json();
      if (data.success) {
        const updated: SubscriptionState = {
          tier: data.tier,
          billingCycle: data.billingCycle,
          validUntil: data.validUntil,
          autoRenew: data.autoRenew,
          token: data.token,
          email: cleanEmail,
          dailySecondsUsed: 0,
          lastQuotaDate: new Date().toISOString().split("T")[0]
        };
        localStorage.setItem("wrt_user_email", cleanEmail);
        localStorage.setItem("wrt_subscription_token", data.token);
        localStorage.setItem("wrt_subscription_tier", data.tier);
        onSubscriptionUpdated(updated);
        setCheckoutSuccess(data.message || `Subscribed successfully! Your license is bound to ${cleanEmail}.`);
        setTimeout(() => {
          setCheckoutSuccess(null);
          onClose();
        }, 2200);
      } else {
        setEmailError(data.message || "Failed to process activation. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setEmailError("Network error processing payment. Please retry.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Upgrade to World Radio Pro
              </h2>
              <p className="text-xs text-slate-400">
                Unlock 24/7 AI live audio translation, DSP equalizer & ad-free streaming
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkoutSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-scale">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-white">Payment Confirmed!</h3>
            <p className="text-sm text-slate-300 max-w-md">{checkoutSuccess}</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            
            {/* Billing Cycle / Tier Switcher */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedTier("pro");
                    setSelectedCycle("monthly");
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedTier === "pro" && selectedCycle === "monthly"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Monthly ($4.99/mo)
                </button>

                <button
                  onClick={() => {
                    setSelectedTier("pro");
                    setSelectedCycle("annual");
                  }}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    selectedTier === "pro" && selectedCycle === "annual"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>Annual ($39.99/yr)</span>
                  <span className="ml-1.5 bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    Save 33%
                  </span>
                </button>
              </div>

              <button
                onClick={() => setSelectedTier("vip")}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedTier === "vip"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-amber-400 hover:text-amber-300"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Lifetime VIP ($79.99)</span>
              </button>
            </div>

            {/* Feature Cards Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pro Tier Card */}
              <div
                onClick={() => setSelectedTier("pro")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTier === "pro"
                    ? "bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/20"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Pro Edition
                    </span>
                    {selectedCycle === "annual" && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        Popular Choice
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-3xl font-extrabold text-white">
                      ${selectedCycle === "annual" ? "39.99" : "4.99"}
                    </span>
                    <span className="text-xs text-slate-400">
                      /{selectedCycle === "annual" ? "year" : "month"}
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span><strong>100% Ad-Free</strong> (Zero banners or interstitials)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span><strong>Unlimited 24/7</strong> AI live stream translation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span><strong>Studio DSP Equalizer</strong> (Bass, Treble, Vocals)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Ultra-HD audio bitrates & priority buffer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>Full transcript export & local saving</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Lifetime VIP Card */}
              <div
                onClick={() => setSelectedTier("vip")}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTier === "vip"
                    ? "bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500 ring-2 ring-amber-500/20"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      Lifetime VIP
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      One-Time Payment
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-3xl font-extrabold text-white">$79.99</span>
                    <span className="text-xs text-slate-400">forever (no renewals)</span>
                  </div>

                  <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span><strong>Everything in Pro</strong> for life</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span><strong>No monthly recurring fees</strong> ever</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>Priority access to new Gemini voice models</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>VIP Gold airwaves badge & direct support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300">Have a Promo or Referral Code?</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. RADIOVIP or PROMO50"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={isVerifyingPromo || !promoCode.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingPromo ? "Verifying..." : "Apply"}
                </button>
              </div>

              {promoResult && (
                <div className={`text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 ${
                  promoResult.valid
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  <span>{promoResult.message}</span>
                </div>
              )}
            </div>

            {/* User Email Registration Section */}
            <div className="flex flex-col gap-2 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Register Account Email</span>
                  <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">*Required</span>
                </label>
                <span className="text-[10px] text-slate-400 hidden sm:inline">License & activation receipt sent here</span>
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="yourname@example.com"
                  className={`w-full bg-slate-900 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    emailError ? "border-rose-500 ring-1 ring-rose-500" : "border-slate-700 focus:border-emerald-500"
                  }`}
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {emailError ? (
                <div className="text-[11px] text-rose-400 flex items-center gap-1.5 pt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400">
                  Your Pro license token will be bound to this email address for easy renewal and recovery across devices.
                </p>
              )}
            </div>

            {/* Quick Digital Wallet Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCheckout("apple_pay")}
                disabled={isCheckingOut}
                className="py-3 rounded-xl bg-white hover:bg-slate-100 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <span> Pay</span>
                <span className="font-normal text-[11px]">(${finalPrice.toFixed(2)})</span>
              </button>

              <button
                onClick={() => handleCheckout("google_pay")}
                disabled={isCheckingOut}
                className="py-3 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <span className="text-blue-400 font-black">G</span>
                <span>Pay</span>
                <span className="font-normal text-[11px]">(${finalPrice.toFixed(2)})</span>
              </button>
            </div>

            {/* Card Checkout Form */}
            <div className="flex flex-col gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Credit / Debit Card (Sandbox Ready)</span>
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  256-bit Encrypted
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="Card Number"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="CVC"
                  />
                </div>
              </div>

              <button
                onClick={() => handleCheckout("card")}
                disabled={isCheckingOut}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer disabled:opacity-50 mt-1"
              >
                {isCheckingOut ? (
                  <span>Processing Activation...</span>
                ) : (
                  <>
                    <span>Complete Upgrade — ${finalPrice.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Instant License Delivery
                </span>
                <span>•</span>
                <span>Cancel Anytime</span>
                <span>•</span>
                <span>30-Day Money Back</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
