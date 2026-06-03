import {
  Lightbulb,
  Users,
  DollarSign,
} from 'lucide-react';

interface CompanyBriefData {
  core_value_prop?: string;
  target_customer_segment?: string;
  revenue_model?: string;
  industry?: string;
  product_type?: string;
}

interface CompanyBriefSectionProps {
  brief: CompanyBriefData | undefined;
}

/**
 * Displays company brief information: value proposition, target customer,
 * and revenue model in a three-column card layout.
 */
export default function CompanyBriefSection({ brief }: CompanyBriefSectionProps) {
  if (!brief) {
    return (
      <div className="text-sm text-text-tertiary italic">
        Insufficient data to generate company brief.
      </div>
    );
  }

  const cards = [
    {
      label: 'Value Proposition',
      icon: Lightbulb,
      value: brief.core_value_prop,
    },
    {
      label: 'Target Customer',
      icon: Users,
      value: brief.target_customer_segment,
    },
    {
      label: 'Revenue Model',
      icon: DollarSign,
      value: brief.revenue_model,
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-bg-tertiary rounded-xl p-5 border border-border-subtle"
            >
              <p className="text-xs uppercase tracking-wider text-text-tertiary mb-2 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {card.label}
              </p>
              <p className="text-sm text-text-primary leading-relaxed">
                {card.value ?? '—'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
