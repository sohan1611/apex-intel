'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'red-flags', label: 'Flags' },
  { id: 'company-brief', label: 'Brief' },
  { id: 'market-analysis', label: 'Market' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'risk-analysis', label: 'Risks' },
  { id: 'assumptions', label: 'Assumptions' },
  { id: 'execution', label: 'Execution' },
  { id: 'contradictions', label: 'Contradictions' },
  { id: 'score-breakdown', label: 'Score' },
] as const;

/**
 * Sticky horizontal navigation bar for mobile viewports.
 * Replaces the sidebar on screens < 1024px.
 */
export default function MobileTabBar() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          setActiveId(intersecting[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleClick = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="lg:hidden sticky top-14 z-40 bg-bg-secondary/95 backdrop-blur-md border-b border-border-default">
      <nav className="flex overflow-x-auto scrollbar-none px-2 py-1.5 gap-0.5">
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-md whitespace-nowrap transition-colors duration-200 shrink-0',
                isActive
                  ? 'bg-accent-primary/10 text-accent-primary font-medium'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50'
              )}
            >
              {section.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
