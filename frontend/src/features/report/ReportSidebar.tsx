'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'red-flags', label: 'Red Flags' },
  { id: 'company-brief', label: 'Company Brief' },
  { id: 'market-analysis', label: 'Market Analysis' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'risk-analysis', label: 'Risk Analysis' },
  { id: 'assumptions', label: 'Assumptions' },
  { id: 'execution', label: 'Execution' },
  { id: 'contradictions', label: 'Contradictions' },
  { id: 'score-breakdown', label: 'Score Breakdown' },
] as const;

/**
 * Fixed sidebar with scroll-spy navigation for report sections.
 * Uses IntersectionObserver to track which section is currently in view
 * and highlights the corresponding link. Hidden on screens < 1024px.
 */
export default function ReportSidebar() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting entry (top-most visible section)
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
      elements.forEach((el) => observer.unobserve(el));
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
    <aside className="hidden lg:block fixed top-14 left-0 w-56 h-[calc(100vh-3.5rem)] overflow-y-auto pt-6 bg-bg-secondary border-r border-border-default z-40">
      <p className="text-[10px] uppercase tracking-widest text-text-tertiary px-4 mb-3">
        Contents
      </p>
      <nav>
        {SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleClick(section.id)}
              className={cn(
                'text-sm py-2 px-4 block w-full text-left transition-colors duration-200 cursor-pointer',
                isActive
                  ? 'text-accent-primary border-l-2 border-accent-primary bg-accent-primary/5 font-medium'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50'
              )}
            >
              {section.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
