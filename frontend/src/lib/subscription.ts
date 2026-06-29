export type SubscriptionTier = 'FREE' | 'PAY_PER_ANALYSIS' | 'PRO_LITE' | 'PRO';

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface PlanConfig {
  tier: SubscriptionTier;
  name: string;
  price: string;
  interval: string;
  description: string;
  monthlyLimit: number;
  aiModel: string;
  pipelineType: string;
  popular?: boolean;
  features: PlanFeature[];
  rank: number;
  providerPriceEnv?: string; // Links to environment variable containing the actual Price ID
}

// Single Source of Truth for the Frontend
// Must be manually synchronized with backend/core/subscription.py
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, PlanConfig> = {
  FREE: {
    tier: 'FREE',
    name: 'Free',
    price: '₹0',
    interval: '/ month',
    description: 'Perfect for exploring Apex Intel before upgrading.',
    monthlyLimit: 2,
    aiModel: 'Gemini 2.5 Flash Lite',
    pipelineType: 'Optimized 3-Agent Pipeline',
    rank: 0,
    features: [
      { name: '2 analyses per month', included: true },
      { name: 'Uses previous-generation AI models', included: true },
      { name: 'Optimized 3-Agent Pipeline', included: true },
      { name: 'Basic company briefing', included: true },
      { name: 'Contradiction detection', included: false },
      { name: 'Hidden assumptions validation', included: false },
      { name: 'Detailed Investment Score Breakdown', included: false },
    ],
  },
  PAY_PER_ANALYSIS: {
    tier: 'PAY_PER_ANALYSIS',
    name: 'Pay-Per-Analysis',
    price: '₹29',
    interval: '/ report',
    description: 'Need only one report? Purchase a single premium analysis without a subscription.',
    monthlyLimit: 0,
    aiModel: 'Gemini 2.5 Flash',
    pipelineType: 'Full 9-Agent Pipeline',
    rank: 1,
    providerPriceEnv: 'STRIPE_PRICE_CREDIT',
    features: [
      { name: 'One-time purchase', included: true },
      { name: 'Credits never expire', included: true },
      { name: 'No subscription required', included: true },
      { name: 'Premium AI Model Access', included: true },
      { name: 'Complete 9-Agent Due Diligence', included: true },
      { name: 'Detailed Investment Score Breakdown', included: true },
      { name: 'Priority Founder Support', included: false },
    ],
  },
  PRO_LITE: {
    tier: 'PRO_LITE',
    name: 'Pro Lite',
    price: '₹45',
    interval: '/ month',
    description: 'Ideal for students, founders, and regular startup research.',
    monthlyLimit: 5,
    aiModel: 'Gemini 2.5 Flash',
    pipelineType: 'Standard 5-Agent Pipeline',
    rank: 2,
    providerPriceEnv: 'STRIPE_PRICE_PRO_LITE',
    features: [
      { name: '5 analyses per month', included: true },
      { name: 'Premium AI Model Access', included: true },
      { name: 'Standard 5-Agent Pipeline', included: true },
      { name: 'Full Investment Report', included: true },
      { name: 'Contradiction detection', included: false },
      { name: 'Hidden assumptions validation', included: false },
      { name: 'Detailed Investment Score Breakdown', included: false },
    ],
  },
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    price: '₹56',
    interval: '/ month',
    description: 'Complete institutional-grade AI due diligence for investors and power users.',
    monthlyLimit: 10,
    aiModel: 'Gemini 2.5 Flash',
    pipelineType: 'Full 9-Agent Pipeline',
    popular: true,
    rank: 3,
    providerPriceEnv: 'STRIPE_PRICE_PRO',
    features: [
      { name: '10 analyses per month', included: true },
      { name: 'Premium AI Model Access', included: true },
      { name: 'Complete 9-Agent Due Diligence', included: true },
      { name: 'Full Investment Report', included: true },
      { name: 'Contradiction detection engine', included: true },
      { name: 'Hidden assumptions validation', included: true },
      { name: 'Detailed Investment Score Breakdown', included: true },
      { name: 'Priority Founder Support', included: true },
    ],
  },
};

export const getPlanConfig = (tier?: string | null): PlanConfig => {
  if (!tier) return SUBSCRIPTION_PLANS.FREE;
  const config = SUBSCRIPTION_PLANS[tier as SubscriptionTier];
  return config || SUBSCRIPTION_PLANS.FREE;
};

export const getPlanRank = (tier: string): number => {
  return getPlanConfig(tier).rank;
};
