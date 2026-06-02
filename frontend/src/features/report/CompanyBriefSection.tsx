import {
  Lightbulb,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Banknote,
} from 'lucide-react';
import type { CompanyBrief } from '@/types/report';

interface CompanyBriefSectionProps {
  brief: CompanyBrief | null;
}

/**
 * Displays company brief information: value proposition, target customer,
 * and revenue model in a three-column card layout with optional metadata pills.
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
      value: brief.value_proposition,
    },
    {
      label: 'Target Customer',
      icon: Users,
      value: brief.target_customer,
    },
    {
      label: 'Revenue Model',
      icon: DollarSign,
      value: brief.revenue_model,
    },
  ];

  const hasMetadata =
    brief.founding_year ||
    brief.headquarters ||
    brief.employee_count ||
    brief.funding_stage;

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
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {hasMetadata && (
        <div className="flex flex-wrap gap-2 mt-4">
          {brief.founding_year && (
            <span className="bg-bg-secondary text-text-tertiary text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              {brief.founding_year}
            </span>
          )}
          {brief.headquarters && (
            <span className="bg-bg-secondary text-text-tertiary text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {brief.headquarters}
            </span>
          )}
          {brief.employee_count && (
            <span className="bg-bg-secondary text-text-tertiary text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Users className="h-3 w-3" />
              {brief.employee_count} employees
            </span>
          )}
          {brief.funding_stage && (
            <span className="bg-bg-secondary text-text-tertiary text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Banknote className="h-3 w-3" />
              {brief.funding_stage}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
