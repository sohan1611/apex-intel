'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';

/**
 * Minimal site footer for Apex Intel.
 * Displays copyright, brand mark, and navigation links.
 */
export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-primary">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-primary/10 border border-accent-primary/20">
              <Activity className="h-3.5 w-3.5 text-accent-primary" />
            </div>
            <span className="text-sm font-semibold text-text-primary tracking-tight">
              Apex<span className="text-accent-primary">Intel</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-text-tertiary">
            <Link href="/dashboard" className="hover:text-text-secondary transition-colors">
              Dashboard
            </Link>
            <Link href="/analyze" className="hover:text-text-secondary transition-colors">
              Analyze
            </Link>
            <Link href="/reports" className="hover:text-text-secondary transition-colors">
              Reports
            </Link>
            <Link href="/about" className="hover:text-text-secondary transition-colors">
              About
            </Link>
            <span className="text-text-muted">·</span>
            <span className="text-text-muted">
              © {new Date().getFullYear()} Apex Intel
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
