'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'primary' | 'dark' | 'icon' | 'favicon';
}

export function Logo({ 
  className, 
  showText = true, 
  variant = 'primary' 
}: LogoProps) {
  if (variant === 'favicon') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="96" height="96" className={className}>
        <defs>
          <linearGradient id="fav" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4444" />
            <stop offset="100%" stopColor="#CC0000" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" fill="#1A1A2E" rx="6"/>
        <text x="2" y="22" fontFamily="Arial Black, sans-serif" fontSize="20" fontWeight="900" fill="#FFFFFF">3</text>
        <polygon points="17,8 17,24 29,16" fill="url(#fav)"/>
      </svg>
    );
  }

  if (variant === 'icon') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" className={className}>
        <defs>
          <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4444" />
            <stop offset="100%" stopColor="#CC0000" />
          </linearGradient>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1A1A2E" />
            <stop offset="100%" stopColor="#16213E" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bgGrad)" rx="22"/>
        <text x="8" y="62" fontFamily="Arial Black, sans-serif" fontSize="52" fontWeight="900" fill="#FFFFFF">3</text>
        <polygon points="52,28 52,72 88,50" fill="url(#iconGrad)"/>
        <text x="50" y="92" fontFamily="Arial Black, sans-serif" fontSize="11" fontWeight="900" fill="#FF4444" textAnchor="middle">PLAY</text>
      </svg>
    );
  }

  if (variant === 'dark') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120" className={className}>
        <defs>
          <linearGradient id="gradDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#FF0000" />
          </linearGradient>
        </defs>
        <rect width="400" height="120" fill="#0D0D1A" rx="12"/>
        <text x="15" y="88" fontFamily="Arial Black, sans-serif" fontSize="85" fontWeight="900" fill="#FFFFFF">3</text>
        <polygon points="93,22 93,95 158,58" fill="url(#gradDark)"/>
        {showText && (
          <text x="170" y="88" fontFamily="Arial Black, sans-serif" fontSize="70" fontWeight="900" fill="#FFFFFF" className="hidden sm:block">PLAY</text>
        )}
      </svg>
    );
  }

  // Default: Primary Logo - suppress hydration warning for browser extensions
  return (
    <div className={cn("flex items-center gap-0 select-none", className)} suppressHydrationWarning>
      {/* Icon Part: "3" and Play Button */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" width="80" height="60" className="shrink-0">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4444" stopOpacity={1} />
            <stop offset="100%" stopColor="#FF0000" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity={1} />
            <stop offset="100%" stopColor="#CC0000" stopOpacity={1} />
          </linearGradient>
        </defs>
        <text x="10" y="90" fontFamily="Arial Black, sans-serif" fontSize="90" fontWeight="900" fill="#FFFFFF">3</text>
        <polygon points="95,25 95,95 155,60" fill="url(#grad1)" rx="4"/>
        <polygon points="100,35 100,85 145,60" fill="url(#grad2)" opacity="0.3"/>
      </svg>

      {/* Text Part: "PLAY" - Hidden on mobile */}
      {showText && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="160 0 240 120" width="120" height="60" className="hidden sm:block shrink-0">
          <text x="168" y="88" fontFamily="Arial Black, sans-serif" fontSize="72" fontWeight="900" fill="#FFFFFF">PLAY</text>
        </svg>
      )}
    </div>
  );
}
