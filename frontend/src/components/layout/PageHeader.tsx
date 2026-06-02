'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Page title displayed as a heading */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Optional action element (e.g., button) positioned to the right */
  action?: ReactNode;
  /** Optional children rendered below the title/subtitle area */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Reusable page header with title, optional subtitle, optional action slot,
 * and optional children. Used at the top of page layouts for consistent heading treatment.
 * Exported as both named and default for compatibility.
 */
export function PageHeader({ title, subtitle, action, children, className }: PageHeaderProps) {
  return (
    <div className={cn('px-6 pt-10 pb-8', className)}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-text-secondary max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default PageHeader;
