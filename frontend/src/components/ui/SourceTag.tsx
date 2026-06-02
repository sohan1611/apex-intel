'use client';

import React from 'react';
import {
  Globe,
  TrendingUp,
  Newspaper,
  FileText,
  MessageCircle,
  Brain,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SourceTag as SourceTagType } from '@/types/report';

const sourceConfig: Record<
  string,
  { icon: React.ElementType; className: string }
> = {
  web_search: { icon: Globe, className: 'bg-blue-500/10 text-blue-400' },
  financial_data: {
    icon: TrendingUp,
    className: 'bg-emerald-500/10 text-emerald-400',
  },
  news: { icon: Newspaper, className: 'bg-amber-500/10 text-amber-400' },
  sec_filing: { icon: FileText, className: 'bg-purple-500/10 text-purple-400' },
  social_media: {
    icon: MessageCircle,
    className: 'bg-pink-500/10 text-pink-400',
  },
  expert_analysis: {
    icon: Brain,
    className: 'bg-indigo-500/10 text-indigo-400',
  },
  internal: {
    icon: Building2,
    className: 'bg-slate-500/10 text-slate-400',
  },
};

function formatSourceType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

interface SourceTagProps {
  source: SourceTagType;
}

export default function SourceTag({ source }: SourceTagProps) {
  const config = sourceConfig[source.source_type] ?? sourceConfig.internal;
  const Icon = config.icon;
  const label = source.label ?? formatSourceType(source.source_type);

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs shrink-0',
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );

  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
      >
        {content}
      </a>
    );
  }

  return content;
}
