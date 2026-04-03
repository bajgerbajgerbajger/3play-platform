'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  PlaySquare,
  Tv,
  Heart,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bottomLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Browse', icon: Compass },
  { href: '/movies', label: 'Movies', icon: PlaySquare },
  { href: '/series', label: 'Series', icon: Tv },
  { href: '/watchlist', label: 'Watchlist', icon: Heart },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 px-2 py-1" suppressHydrationWarning>
      <div className="flex items-center justify-around" suppressHydrationWarning>
        {bottomLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[64px]',
                isActive
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
              suppressHydrationWarning
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-red-600')} />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
