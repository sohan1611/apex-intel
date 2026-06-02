'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Plus, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Primary navigation bar for Apex Intel.
 * Fixed at the top with responsive mobile hamburger menu.
 * Contains logo, navigation links, and "New Analysis" CTA.
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg-secondary border-b border-border-default">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <BarChart3 className="h-5 w-5 text-text-primary group-hover:text-accent-primary transition-colors" />
            <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-accent-primary" />
          </div>
          <span className="font-semibold text-text-primary text-lg tracking-tight">
            Apex Intel
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/reports"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Reports
          </Link>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium
                       bg-accent-primary hover:bg-accent-hover text-white
                       transition-colors shadow-sm shadow-accent-primary/25"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={cn(
          'md:hidden absolute top-14 left-0 right-0 bg-bg-secondary border-b border-border-default overflow-hidden transition-all duration-200',
          mobileMenuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-3 space-y-2">
          <Link
            href="/reports"
            className="block px-3 py-2 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Reports
          </Link>
          <Link
            href="/analyze"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium
                       bg-accent-primary hover:bg-accent-hover text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Link>
        </div>
      </div>
    </nav>
  );
}

export { Navbar };

