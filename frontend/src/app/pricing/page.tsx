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
                    "w-full py-3 px-4 rounded-lg font-medium transition-colors flex justify-center items-center gap-2 border",
                    isCurrentPlan 
                      ? "bg-bg-primary text-text-secondary border-border-default hover:bg-bg-tertiary"
                      : plan.tier === 'PAY_PER_ANALYSIS'
                        ? "bg-bg-secondary text-text-primary border-border-hover hover:border-text-primary hover:bg-bg-tertiary"
                        : plan.popular
                          ? "bg-accent-primary border-accent-primary hover:bg-accent-hover text-white shadow-sm"
                          : "bg-text-primary border-text-primary hover:bg-text-secondary text-bg-primary"
                  )}
                >
                  {isUpgradingThis && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCurrentPlan 
                    ? 'Current Plan ✓'
                    : plan.tier === 'PAY_PER_ANALYSIS'
                      ? (status !== 'authenticated' ? 'Sign In to Buy' : 'Buy 1 Credit')
                      : isDowngrade
                        ? 'Downgrade'
                        : status !== 'authenticated'
                          ? 'Sign In to Select'
                          : 'Upgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default">
              <h3 className="font-semibold text-lg mb-2">How do monthly limits work?</h3>
              <p className="text-text-secondary text-sm">Your analysis quota resets on the 1st of every month. Unused monthly analyses do not roll over to the next month.</p>
            </div>
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default">
              <h3 className="font-semibold text-lg mb-2">What happens if I run out of my monthly limit?</h3>
              <p className="text-text-secondary text-sm">You won't be charged automatically. You can either upgrade to a higher tier or purchase Pay-Per-Analysis credits which never expire and can be used on top of your plan.</p>
            </div>
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-text-secondary text-sm">Yes, you can cancel your subscription at any time from your Account Settings. You'll retain access to your plan until the end of your billing cycle.</p>
            </div>
            <div className="bg-bg-secondary p-6 rounded-xl border border-border-default">
              <h3 className="font-semibold text-lg mb-2">What's the difference between the Optimized and Full 9-Agent pipeline?</h3>
              <p className="text-text-secondary text-sm">The Optimized pipeline uses 3 specialized agents to quickly analyze market opportunity and product-market fit. The Full 9-Agent pipeline invokes our complete suite of expert agents, including deep financial auditing, contradiction detection, and rigorous risk assessment.</p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
