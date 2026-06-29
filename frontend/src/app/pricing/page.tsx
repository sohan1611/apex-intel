'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { Check, X, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { apiClient } from '@/lib/api-client';

import { SUBSCRIPTION_PLANS, getPlanConfig, getPlanRank } from '@/lib/subscription';

const PLANS = Object.values(SUBSCRIPTION_PLANS);

export default function PricingPage() {
  const { data: session, status, update } = useSession();
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const userTier = (session as any)?.user?.tier || 'FREE';
  const analysesUsed = (session as any)?.user?.analyses_used || 0;
  const purchasedCredits = (session as any)?.user?.purchased_credits || 0;
  const resetDateString = (session as any)?.user?.monthly_reset_date;
  
  const formattedResetDate = resetDateString 
    ? new Date(resetDateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';
  
  const userConfig = getPlanConfig(userTier);
  const currentLimit = userConfig.monthlyLimit;

  const handleUpgrade = async (tier: string) => {
    if (status !== 'authenticated') {
      signIn('google');
      return;
    }

    try {
      setUpgradingTo(tier);
      if (tier === 'PAY_PER_ANALYSIS') {
        const res = await apiClient.purchaseCredits(1);
        if (res.checkout_url) {
            window.location.href = res.checkout_url;
            return;
        }
        await update();
        setNotification({ type: 'success', text: 'Successfully purchased 1 analysis credit!' });
      } else {
        const res = await apiClient.upgradeSubscription(tier);
        if (res.checkout_url) {
            window.location.href = res.checkout_url;
            return;
        }
        await update();
        setNotification({ type: 'success', text: `Successfully upgraded to ${tier}!` });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Stripe payments are not yet enabled')) {
          setNotification({ type: 'error', text: 'Billing is currently in Sandbox preparation mode. Real payments are not yet enabled for this environment.' });
      } else {
          setNotification({ type: 'error', text: error instanceof Error ? error.message : 'Action failed' });
      }
    } finally {
      setUpgradingTo(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary font-sans text-text-primary">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-14">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16 relative">
          {notification && (
            <div className={cn("absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in z-50 whitespace-nowrap", notification.type === 'success' ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20")}>
              {notification.text}
            </div>
          )}
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
            <div className="flex justify-between items-center mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-semibold border border-accent-primary/20">
                <Check className="h-4 w-4" /> Current Plan: {userConfig.name}
              </span>
              <span className="text-sm font-medium">
                {analysesUsed} / {currentLimit} analyses used
              </span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2.5 overflow-hidden mb-2">
              <div 
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  (analysesUsed / currentLimit) > 0.8 ? "bg-red-500" : "bg-accent-primary"
                )}
                style={{ width: `${Math.min(100, (analysesUsed / currentLimit) * 100)}%` }}
              ></div>
            </div>
            {userTier !== 'PAY_PER_ANALYSIS' && (
              <div className="text-xs text-text-tertiary mb-4 text-right">
                Resets on {formattedResetDate}
              </div>
            )}
            {purchasedCredits > 0 && (
              <div className="flex items-center gap-2 text-sm text-accent-primary bg-accent-primary/10 px-3 py-2 rounded-lg border border-accent-primary/20 mb-4">
                <Zap className="w-4 h-4" />
                <strong>{purchasedCredits}</strong> Pay-Per-Analysis credits available
              </div>
            )}
            {userTier === 'FREE' && (
              <p className="text-xs text-text-tertiary bg-bg-tertiary p-3 rounded-lg border border-border-default">
                <strong className="text-text-secondary">What happens when my quota is empty?</strong><br />
                You will not be automatically charged. You will simply be prompted to purchase Pay-Per-Analysis credits or upgrade to a Pro plan if you wish to run more analyses.
              </p>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrentPlan = userTier === plan.tier;
            const isDowngrade = getPlanRank(plan.tier) < getPlanRank(userTier);
            const isUpgradingThis = upgradingTo === plan.tier;

            return (
              <div 
                key={plan.tier}
                className={cn(
                  "relative flex flex-col p-8 bg-bg-secondary rounded-2xl border transition-all duration-300",
                  plan.popular 
                    ? "border-accent-primary shadow-lg shadow-accent-primary/20 scale-105 z-10 hover:shadow-xl hover:shadow-accent-primary/30" 
                    : "border-border-default hover:border-border-hover hover:-translate-y-1 hover:shadow-md"
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
                  <div className="flex flex-col mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                      <span className="text-text-secondary">{plan.interval}</span>
                    </div>
                    {plan.popular && (
                      <span className="text-sm font-medium text-green-500 mt-1">Save over 80% vs Pay-Per-Analysis</span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm min-h-[40px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-3 text-sm">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-text-tertiary shrink-0" />
                        )}
                        <span className={feature.included ? 'text-text-primary' : 'text-text-tertiary'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={isCurrentPlan || upgradingTo !== null}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex justify-center items-center gap-2 border",
                    isCurrentPlan 
                      ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20 shadow-sm cursor-default"
                      : plan.tier === 'PAY_PER_ANALYSIS'
                        ? "bg-bg-secondary text-text-primary border-border-hover hover:border-text-primary hover:bg-bg-tertiary"
                        : plan.popular
                          ? "bg-accent-primary border-accent-primary hover:bg-accent-hover text-white shadow-md hover:shadow-lg hover:shadow-accent-primary/20"
                          : "bg-text-primary border-text-primary hover:bg-text-secondary text-bg-primary shadow-sm hover:shadow-md"
                  )}
                >
                  {isUpgradingThis && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCurrentPlan 
                    ? '✓ Current Plan'
                    : plan.tier === 'PAY_PER_ANALYSIS'
                      ? (status !== 'authenticated' ? 'Sign In to Buy' : 'Buy 1 Credit')
                      : isDowngrade
                        ? (plan.tier === 'FREE' ? 'Switch to Free' : 'Switch Plan')
                        : status !== 'authenticated'
                          ? 'Sign In to Select'
                          : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-4">Understanding Your Limits</h2>
            <p className="text-text-secondary">Everything you need to know about billing and quotas.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default hover:border-border-hover transition-colors">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-accent-primary" /> Monthly Reset</h3>
              <p className="text-text-secondary text-sm">Your analysis quota resets automatically on your billing date. Unused monthly analyses do not roll over to the next month.</p>
            </div>
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default hover:border-border-hover transition-colors">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Never Pay Unexpectedly</h3>
              <p className="text-text-secondary text-sm">Free users are never automatically charged. When your quota is empty, you simply decide whether to wait, upgrade, or buy credits.</p>
            </div>
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default hover:border-border-hover transition-colors">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-accent-primary" /> Credits Never Expire</h3>
              <p className="text-text-secondary text-sm">Pay-Per-Analysis credits can be used anytime, indefinitely. They act as permanent top-ups that stack with your subscription.</p>
            </div>
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default hover:border-border-hover transition-colors">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-accent-primary" /> Maximum Flexibility</h3>
              <p className="text-text-secondary text-sm">You can upgrade, switch plans, or cancel your subscription at any time. You retain access until the end of the billing cycle.</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
