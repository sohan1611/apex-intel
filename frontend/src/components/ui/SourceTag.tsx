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

/** Source can be a structured object or a plain string */
type SourceInput =
  | { source_type: string; label?: string; url?: string }
  | string;

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
  inferred: {
    icon: Brain,
    className: 'bg-indigo-500/10 text-indigo-400',
  },
};

function formatSourceType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Parse a source string like "web_search: Some label" into type + label */
function parseSourceString(raw: string): { source_type: string; label: string } {
  const colonIndex = raw.indexOf(':');
  if (colonIndex > 0) {
    const prefix = raw.slice(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
    const label = raw.slice(colonIndex + 1).trim();
    // Check if prefix is a known source type
    if (sourceConfig[prefix]) {
      return { source_type: prefix, label: label || formatSourceType(prefix) };
    }
  }
  // Fallback: try to match known prefixes
  const lower = raw.toLowerCase();
  if (lower.startsWith('web_search') || lower.startsWith('web search')) return { source_type: 'web_search', label: raw };
  if (lower.startsWith('inferred')) return { source_type: 'inferred', label: raw };
  return { source_type: 'internal', label: raw };
}

interface SourceTagProps {
  source: SourceInput;
}

export function SourceTag({ source }: SourceTagProps) {
  // Normalize source to object form
  const normalized = typeof source === 'string'
    ? parseSourceString(source)
    : source;

  const config = sourceConfig[normalized.source_type] ?? sourceConfig.internal;
  const Icon = config.icon;
  const label = normalized.label ?? formatSourceType(normalized.source_type);

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs shrink-0',
        config.className
      )}
    >
      <Icon className="w-3 h-3" />
      <span className="truncate max-w-[200px]">{label}</span>
    </span>
  );

  if (typeof source !== 'string' && source.url) {
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
