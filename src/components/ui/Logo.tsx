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
    <div className={cn("flex items-center gap-2 select-none group", className)} suppressHydrationWarning>
      <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl group-hover:border-red-600/50 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="text-2xl font-black text-white z-10 tracking-tighter">3</span>
        <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-red-600 border-b-[8px] border-b-transparent drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform duration-300" />
      </div>

      {showText && (
        <div className="flex flex-col -space-y-1">
          <span className="text-xl font-black text-white tracking-tight leading-none">
            3PLAY
          </span>
          <span className="text-[10px] font-bold text-red-600 tracking-[0.2em] leading-none uppercase opacity-80">
            Infrastructure
          </span>
        </div>
      )}
    </div>
  );
}
