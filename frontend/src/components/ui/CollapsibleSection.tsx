import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: React.ReactNode;
}

export function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = true,
  className,
  badge
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section id={id} className={cn("scroll-mt-20", className)}>
      <div 
        className="flex items-center justify-between cursor-pointer py-4 border-b border-border-default hover:bg-bg-tertiary/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            {title}
          </h2>
          {badge && <div>{badge}</div>}
        </div>
        <button 
          className="p-1 rounded hover:bg-bg-tertiary transition-colors"
          aria-label={isOpen ? "Collapse section" : "Expand section"}
        >
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-text-muted" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-muted" />
          )}
        </button>
      </div>
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isOpen ? "max-h-[5000px] opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
        )}
      >
        {children}
      </div>
    </section>
  );
}
