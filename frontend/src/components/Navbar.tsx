'use client';

import React from 'react';
import { Gem } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="h-14 bg-bg-secondary/80 backdrop-blur-xl border-b border-border-default sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 h-full max-w-screen-2xl mx-auto">
        {/* Left side — brand */}
        <div className="flex items-center gap-2.5">
          <Gem className="w-5 h-5 text-accent-primary" />
          <span className="font-semibold text-lg text-text-primary">
            Apex Intel
          </span>
          <span className="text-[10px] bg-accent-primary/15 text-accent-primary px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider">
            BETA
          </span>
        </div>

        {/* Right side — avatar */}
        <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-xs font-medium text-accent-primary">
          AK
        </div>
      </div>
    </nav>
  );
}
