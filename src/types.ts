export interface RadioStation {
  changeid?: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage?: string;
  favicon?: string;
  tags?: string;
  country?: string;
  countrycode?: string;
  state?: string;
  language?: string;
  votes?: number;
  clickcount?: number;
  codec?: string;
  bitrate?: number;
  currentShow?: string;
  geo_lat?: number | null;
  geo_long?: number | null;
  distanceKm?: number;
  withinRadius?: boolean;
}

export interface LocationGeoProfile {
  country: string;
  countryCode: string;
  countryCodes?: string[];
  language: string;
  capital: string;
  description: string;
  nativeGreeting: string;
  genres: string[];
}

export interface BroadcastSegment {
  type: 'Station Profile' | 'Artist Spotlight' | 'Language Phrase' | 'Music History' | 'Broadcaster Tagline';
  originalText: string;
  estimatedDuration: number; // in seconds
}

export type VisualizerMode = 'oscilloscope' | 'spectrum' | 'circular' | 'vu_meter';

export interface AudioEnhancements {
  bassBoost: number; // 0 to 100, default 50
  treble: number; // 0 to 100, default 50
  vocalClarity: number; // 0 to 100, default 50
}

export type SubscriptionTier = 'free' | 'pro' | 'vip';
export type BillingCycle = 'monthly' | 'annual' | 'lifetime';

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  billingCycle: BillingCycle;
  price: number;
  priceDisplay: string;
  period: string;
  savings?: string;
  features: string[];
  isPopular?: boolean;
}

export interface SubscriptionState {
  tier: SubscriptionTier;
  billingCycle?: BillingCycle;
  validUntil?: string | null;
  autoRenew: boolean;
  token?: string;
  email?: string;
  rewardedExpiresAt?: number | null; // timestamp in ms
  dailySecondsUsed: number;
  lastQuotaDate: string; // YYYY-MM-DD
}

export interface AdConfig {
  bannerAdUnitId: string;
  interstitialAdUnitId: string;
  rewardedAdUnitId: string;
  stationChangeFrequencyCap: number;
  rewardedMinutesGranted: number;
  isEnabled: boolean;
}

export type ActiveTab = 'radio' | 'translator' | 'favorites' | 'pro';

export interface RecentlyPlayedItem {
  station: RadioStation;
  timestamp: number;
}

export interface SavedTranscriptItem {
  id: string;
  stationName: string;
  stationCountry?: string;
  stationUuid?: string;
  stationUrl?: string;
  targetLang: string;
  sourceLang?: string;
  timestamp: number;
  originalText?: string;
  translatedText?: string;
  turns: Array<{
    timestamp: number;
    originalText: string;
    translatedText: string;
  }>;
  title?: string;
  notes?: string;
  isSnippet?: boolean;
}
