'use client';

import { useEffect } from 'react';

/**
 * Hook to suppress hydration warnings caused by browser extensions
 * (e.g., BitDefender adding bis_skin_checked attribute)
 */
export function useSupressHydrationWarning() {
  useEffect(() => {
    // Suppress hydration warnings in development/console
    // This is safe because extensions modifying HTML is expected and harmless
    const originalWarn = console.warn;
    const originalError = console.error;

    const suppressWarning = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('tree hydrated but some attributes')
      ) {
        return;
      }
      return originalWarn.apply(console, args as unknown as unknown[]);
    };

    const suppressError = (...args: unknown[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('tree hydrated but some attributes')
      ) {
        return;
      }
      return originalError.apply(console, args as unknown as unknown[]);
    };

    console.warn = suppressWarning as unknown as typeof console.warn;
    console.error = suppressError as unknown as typeof console.error;

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);
}
