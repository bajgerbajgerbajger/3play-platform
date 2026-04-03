'use client';

import { ReactNode } from 'react';

interface HydrationSafeProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component for elements that may have hydration mismatches due to browser extensions
 * (e.g., BitDefender adding bis_skin_checked attribute)
 */
export function HydrationSafe({ children, className }: HydrationSafeProps) {
  return (
    <div className={className} suppressHydrationWarning>
      {children}
    </div>
  );
}
