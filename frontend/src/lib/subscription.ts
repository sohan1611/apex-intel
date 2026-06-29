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
}

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
    popular: true,
    description: 'Complete institutional-grade AI due diligence for investors and power users.',
    monthlyLimit: 10,
    aiModel: 'Gemini 2.5 Flash',
    pipelineType: 'Full 9-Agent Pipeline',
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
  const ranks: Record<string, number> = {
    FREE: 0,
    PAY_PER_ANALYSIS: 1, // Treat as side-grade or level 1
    PRO_LITE: 2,
    PRO: 3
  };
  return ranks[tier] ?? 0;
};
