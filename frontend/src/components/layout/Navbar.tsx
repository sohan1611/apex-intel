'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Plus, Menu, X, LogOut, LogIn } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

/**
 * Navigation link data.
 */
const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/reports', label: 'Reports' },
  { href: '/reports/compare', label: 'Compare' },
  { href: '/about', label: 'About' },
] as const;

/**
 * Primary navigation bar for Apex Intel.
 * Fixed at the top with responsive mobile hamburger menu.
 * Contains logo, navigation links with active indicators, and "New Analysis" CTA.
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  /**
   * Determines if a nav link is active based on the current pathname.
   */
  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/reports/compare') return pathname === '/reports/compare';
    if (href === '/reports') return pathname === '/reports';
    return pathname.startsWith(href);
  }

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
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3 py-1.5 text-sm rounded-md transition-colors',
                  active
                    ? 'text-text-primary font-medium'
                    : 'text-text-tertiary hover:text-text-secondary'
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-accent-primary" />
                )}
              </Link>
            );
          })}

          <div className="w-px h-5 bg-border-default mx-2" />

          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-4 mx-2">
              <span className="text-sm font-medium text-text-secondary truncate max-w-[120px]">
                {session.user.name}
              </span>
              <button 
                onClick={() => signOut()} 
                className="text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1 text-sm"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : status !== 'loading' ? (
            <button 
              onClick={() => signIn('google')} 
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mx-2 flex items-center gap-1.5"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          ) : (
            <div className="w-20 h-5 animate-pulse bg-bg-tertiary rounded mx-2" />
          )}

          <div className="w-px h-5 bg-border-default mx-2" />

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
          mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm transition-colors',
                  active
                    ? 'text-text-primary font-medium bg-bg-tertiary/50'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border-default mt-2">
            {status === 'authenticated' && session?.user ? (
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-sm font-medium text-text-secondary">{session.user.name}</span>
                <button 
                  onClick={() => signOut()} 
                  className="text-sm text-text-tertiary hover:text-text-primary flex items-center gap-1"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : status !== 'loading' ? (
              <button 
                onClick={() => signIn('google')} 
                className="w-full text-left px-3 py-3 text-sm font-medium text-text-secondary hover:text-text-primary flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" /> Sign In with Google
              </button>
            ) : null}

            <Link
              href="/analyze"
              className="mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium
                         bg-accent-primary hover:bg-accent-hover text-white transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Plus className="h-4 w-4" />
              New Analysis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { Navbar };
