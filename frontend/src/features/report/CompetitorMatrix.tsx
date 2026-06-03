import { SourceTag } from '@/components/ui/SourceTag';
import type { CompetitorEntry } from '@/types/report';

interface CompetitorMatrixProps {
  competitors: CompetitorEntry[] | undefined;
}

/**
 * Renders a full-width comparison table of competitors with styled
 * strength/weakness tags and source attribution.
 */
export default function CompetitorMatrix({ competitors }: CompetitorMatrixProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="text-sm text-text-tertiary italic">
        No competitor data available.
      </div>
    );
  }

  return (
    <div className="bg-bg-tertiary rounded-xl border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
                Company
              </th>
              <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
                Pricing
              </th>
              <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
                Positioning
              </th>
              <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
                Strengths
              </th>
              <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
                Weaknesses
              </th>
              <th className="text-xs uppercase tracking-wider text-text-tertiary px-4 py-3 font-medium">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((competitor, index) => (
              <tr
                key={competitor.company_name ?? index}
                className="border-b border-border-subtle last:border-b-0 hover:bg-bg-secondary/50 transition-colors"
              >
                {/* Company */}
                <td className="px-4 py-4 text-sm font-medium text-text-primary whitespace-nowrap">
                  {competitor.company_name}
                </td>

                {/* Pricing */}
                <td className="px-4 py-4 text-sm text-text-secondary">
                  {competitor.pricing}
                </td>

                {/* Positioning */}
                <td className="px-4 py-4 text-sm text-text-secondary max-w-[200px]">
                  {competitor.positioning}
                </td>

                {/* Strengths */}
                <td className="px-4 py-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {competitor.strengths.map((strength, i) => (
                      <span
                        key={i}
                        className="bg-emerald-500/10 text-emerald-400 text-xs rounded-md px-1.5 py-0.5"
                      >
                        {strength}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Weaknesses */}
                <td className="px-4 py-4 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {competitor.weaknesses.map((weakness, i) => (
                      <span
                        key={i}
                        className="bg-red-500/10 text-red-400 text-xs rounded-md px-1.5 py-0.5"
                      >
                        {weakness}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Source */}
                <td className="px-4 py-4 text-sm">
                  <SourceTag source={competitor.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
