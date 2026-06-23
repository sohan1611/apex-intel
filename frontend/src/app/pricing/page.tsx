'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { Check, X, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { apiClient } from '@/lib/api-client';

const PLANS = [
  {
    tier: 'FREE',
    name: 'Free',
    price: '₹0',
    interval: '/ month',
    description: 'Perfect for exploring the platform capabilities.',
    features: [
      '2 analyses per month',
      'Optimized 3-agent pipeline',
      'Basic company briefing',
      'Market opportunity analysis',
    ],
    notIncluded: [
      'Contradiction detection',
      'Hidden assumptions validation',
      'Premium score breakdown',
    ],
  },
  {
    tier: 'PAY_PER_ANALYSIS',
    name: 'Pay-Per-Analysis',
    price: '₹10',
    interval: '/ report',
    description: 'Full premium analysis without a monthly commitment.',
    features: [
      'Credits never expire',
      'Full 9-agent pipeline',
      'Contradiction detection engine',
      'Hidden assumptions validation',
      'Premium score breakdown',
    ],
    notIncluded: [
      'Monthly quota reset',
      'White-glove support',
    ],
  },
  {
    tier: 'PRO_LITE',
    name: 'Pro Lite',
    price: '₹45',
    interval: '/ month',
    description: 'For moderate volume users who need fast insights.',
    features: [
      '5 analyses per month',
      'Premium AI Model Access',
      'Standard investment memo',
      'Priority email support',
    ],
    notIncluded: [
      'Contradiction detection',
      'Hidden assumptions validation',
      'Premium score breakdown',
    ],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: '₹56',
    interval: '/ month',
    popular: true,
    description: 'Full-fidelity 9-agent analysis for institutional investors.',
    features: [
      '10 analyses per month',
      'Full 9-agent pipeline',
      'Contradiction detection engine',
      'Hidden assumptions validation',
      'Premium score breakdown',
      'White-glove support',
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  const { data: session, status, update } = useSession();
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  const userTier = (session as any)?.user?.subscription_tier || 'FREE';
  const analysesUsed = (session as any)?.user?.analyses_used || 0;
  const purchasedCredits = (session as any)?.user?.purchased_credits || 0;
  
  const getLimits = (tier: string) => {
    if (tier === 'PRO') return 10;
    if (tier === 'PRO_LITE') return 5;
    return 2;
  };

  const currentLimit = getLimits(userTier);

  const handleUpgrade = async (tier: string) => {
    if (status !== 'authenticated') {
      signIn('google');
      return;
    }

    try {
      setUpgradingTo(tier);
      if (tier === 'PAY_PER_ANALYSIS') {
        await apiClient.purchaseCredits(1);
        await update();
        alert('Successfully purchased 1 analysis credit!');
      } else {
        await apiClient.upgradeSubscription(tier);
        await update();
        alert(`Successfully upgraded to ${tier}!`);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setUpgradingTo(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary font-sans text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-14">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-text-secondary">
            Get the institutional-grade due diligence capabilities you need.
          </p>
        </div>

        {/* Current Usage Widget */}
        {status === 'authenticated' && (
          <div className="max-w-2xl mx-auto mb-16 bg-bg-secondary border border-border-default rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Your Current Usage</h2>
            <div className="flex justify-between items-end mb-2">
              <span className="text-text-secondary text-sm">
                Current Plan: <strong className="text-text-primary">{userTier}</strong>
              </span>
              <span className="text-sm font-medium">
                {analysesUsed} / {currentLimit} analyses used
              </span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2.5 overflow-hidden mb-4">
              <div 
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  (analysesUsed / currentLimit) > 0.8 ? "bg-red-500" : "bg-accent-primary"
                )}
                style={{ width: `${Math.min(100, (analysesUsed / currentLimit) * 100)}%` }}
              ></div>
            </div>
            {purchasedCredits > 0 && (
              <div className="flex items-center gap-2 text-sm text-accent-primary bg-accent-primary/10 px-3 py-2 rounded-lg border border-accent-primary/20">
                <Zap className="w-4 h-4" />
                <strong>{purchasedCredits}</strong> Pay-Per-Analysis credits available
              </div>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrentPlan = userTier === plan.tier;
            const isDowngrade = getLimits(plan.tier) < getLimits(userTier);
            const isUpgradingThis = upgradingTo === plan.tier;

            return (
              <div 
                key={plan.tier}
                className={cn(
                  "relative flex flex-col p-8 bg-bg-secondary rounded-2xl border transition-all",
                  plan.popular 
                    ? "border-accent-primary shadow-lg shadow-accent-primary/10 scale-105 z-10" 
                    : "border-border-default hover:border-border-hover"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-accent-primary text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-sm">
                    <Zap className="w-3 h-3 fill-current" />
                    MOST POPULAR
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    <span className="text-text-secondary">{plan.interval}</span>
                  </div>
                  <p className="text-text-secondary text-sm min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-text-primary">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <X className="h-5 w-5 text-text-tertiary shrink-0" />
                        <span className="text-text-tertiary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isCurrentPlan || isDowngrade || upgradingTo !== null}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium transition-colors flex justify-center items-center gap-2",
                    isCurrentPlan 
                      ? "bg-bg-tertiary text-text-secondary cursor-not-allowed"
                      : isDowngrade
                        ? "bg-bg-tertiary text-text-secondary cursor-not-allowed"
                        : plan.popular
                          ? "bg-accent-primary hover:bg-accent-hover text-white shadow-sm"
                          : "bg-text-primary hover:bg-text-secondary text-bg-primary"
                  )}
                >
                  {isUpgradingThis && <Loader2 className="h-4 w-4 animate-spin" />}
                  {plan.tier === 'PAY_PER_ANALYSIS'
                    ? (status !== 'authenticated' ? 'Sign In to Buy' : 'Buy 1 Credit')
                    : isCurrentPlan 
                      ? 'Current Plan' 
                      : isDowngrade 
                        ? 'Included in Current' 
                        : status !== 'authenticated' 
                          ? 'Sign In to Select' 
                          : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
}
