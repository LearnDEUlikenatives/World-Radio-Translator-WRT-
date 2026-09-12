import React, { useState, useEffect } from "react";
import { SubscriptionTier, AdConfig } from "../types";
import { Info, X, Sparkles, ExternalLink } from "lucide-react";

interface AdBannerProps {
  tier: SubscriptionTier;
  onOpenUpgrade: () => void;
  adConfig?: AdConfig | null;
}

const AD_CREATIVES = [
  {
    sponsor: "Google Cloud Vertex AI",
    headline: "Build intelligent audio translation apps with Gemini 2.5",
    cta: "Explore Cloud SDK",
    color: "from-blue-600 to-indigo-700",
    link: "https://cloud.google.com/vertex-ai"
  },
  {
    sponsor: "Google Pixel Buds Pro",
    headline: "Live translation in your ear with real-time active noise cancellation",
    cta: "Learn More",
    color: "from-teal-600 to-emerald-700",
    link: "https://store.google.com"
  },
  {
    sponsor: "World Radio VIP Pass",
    headline: "Unlock 24/7 unlimited AI voice translation & ultra HD bitrates",
    cta: "Upgrade for $4.99",
    color: "from-amber-600 to-rose-600",
    isInternalPromo: true
  }
];

export default function AdBanner({
  tier,
  onOpenUpgrade,
  adConfig
}: AdBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Rotate ad every 25 seconds
  useEffect(() => {
    if (tier === "pro" || tier === "vip" || isDismissed) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % AD_CREATIVES.length);
    }, 25000);
    return () => clearInterval(timer);
  }, [tier, isDismissed]);

  // Pro & VIP users NEVER see ads, or if user dismissed in current session
  if (tier === "pro" || tier === "vip" || isDismissed) {
    return null;
  }

  const ad = AD_CREATIVES[currentAdIndex];

  return (
    <aside
      aria-label="Advertisement"
      className="w-full bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 transition-all shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Ad Badge & Sponsor message */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5 sm:mt-0">
            <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-[10px] px-1.5 py-0.5 rounded-md tracking-wider uppercase font-mono">
              Ad
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans hidden sm:inline-flex items-center gap-0.5">
              AdMob
              <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
            </span>
          </div>

          <div className="min-w-0 flex-1 leading-snug">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mr-1.5">
              {ad.sponsor}:
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">
              {ad.headline}
            </span>
          </div>
        </div>

        {/* Right: CTA & Dismiss */}
        <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800/60">
          {ad.isInternalPromo ? (
            <button
              onClick={onOpenUpgrade}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:brightness-110 transition-all flex items-center gap-1 shadow-sm cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              <span>{ad.cta}</span>
            </button>
          ) : (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{ad.cta}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            title="Dismiss ad"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
