import { Info, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { SourceTag } from '@/components/ui/SourceTag';
import { formatCurrency } from '@/lib/utils';
import type { MarketAnalysis } from '@/types/report';

interface MarketAnalysisSectionProps {
  market: MarketAnalysis | null | undefined;
}

/**
 * Displays market analysis data including TAM/SAM/SOM estimates,
 * confidence score, uncertainty factors, and market trends.
 */
export default function MarketAnalysisSection({ market }: MarketAnalysisSectionProps) {
  if (!market) {
    return (
      <div className="text-sm text-text-tertiary italic">
        Insufficient data to generate market analysis.
      </div>
    );
  }

  return (
    <div>
      {/* TAM / SAM / SOM Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Addressable Market"
          value={market.tam_estimate != null ? formatCurrency(market.tam_estimate) : 'Data unavailable'}
        />
        <MetricCard
          label="Serviceable Addressable Market"
          value={market.sam_estimate != null ? formatCurrency(market.sam_estimate) : 'Data unavailable'}
        />
        <MetricCard
          label="Serviceable Obtainable Market"
          value={market.som_estimate != null ? formatCurrency(market.som_estimate) : 'Data unavailable'}
        />
      </div>

      {/* Confidence Bar */}
      <div className="mt-4">
        <ConfidenceBar
          value={market.confidence_score}
          label="Market Confidence"
        />
      </div>

      {/* Uncertainty Factors */}
      {market.uncertainty_factor && (
        <div className="bg-blue-500/5 border-l-2 border-blue-500 p-4 rounded-r-lg mt-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs uppercase text-blue-400 font-medium">
              Uncertainty Factors
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {market.uncertainty_factor}
          </p>
        </div>
      )}

      {/* Market Trends */}
      {market.market_trends && market.market_trends.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-text-primary mb-3">
            Market Trends
          </h3>
          {market.market_trends.map((item, index) => (
            <div
              key={index}
              className="bg-bg-tertiary rounded-lg p-3 border border-border-subtle mb-2 flex items-start gap-3"
            >
              <TrendingUp className="text-accent-primary w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm text-text-secondary flex-1">
                {item.trend}
              </span>
              <SourceTag source={item.source} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
