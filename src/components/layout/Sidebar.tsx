'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  PlaySquare,
  Tv,
  Heart,
  History,
  Clock,
  ThumbsUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Browse', icon: Compass },
  { href: '/movies', label: 'Movies', icon: PlaySquare },
  { href: '/series', label: 'Series', icon: Tv },
];

const personalLinks = [
  { href: '/profile', label: 'Your Channel', icon: Home },
  { href: '/watchlist', label: 'Watchlist', icon: Heart },
  { href: '/profile?tab=history', label: 'History', icon: History },
  { href: '/profile?tab=continue', label: 'Continue Watching', icon: Clock },
  { href: '/profile?tab=favorites', label: 'Favorites', icon: ThumbsUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-transparent overflow-y-auto custom-scrollbar" suppressHydrationWarning>
      <div className="p-4 space-y-8" suppressHydrationWarning>
        {/* Hlavní Navigace */}
        <div className="space-y-1.5" suppressHydrationWarning>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white hover:translate-x-1'
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", !isActive && "group-hover:scale-110")} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Osobní Sekce */}
        <div className="space-y-1.5" suppressHydrationWarning>
          <h3 className="px-4 py-2 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            Moje Aktivity
          </h3>
          {personalLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white hover:translate-x-1'
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", !isActive && "group-hover:scale-110")} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Kategorie */}
        <div className="space-y-1.5" suppressHydrationWarning>
          <h3 className="px-4 py-2 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
            Kategorie
          </h3>
          <div className="grid grid-cols-1 gap-1" suppressHydrationWarning>
            {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Documentary'].map((genre) => (
              <Link
                key={genre}
                href={`/browse?genre=${genre.toLowerCase()}`}
                className="group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all duration-200 hover:translate-x-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-red-500 transition-colors" />
                {genre}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8 px-4 text-[11px] text-zinc-600 font-medium" suppressHydrationWarning>
          <div className="flex flex-wrap gap-x-4 gap-y-2" suppressHydrationWarning>
            <Link href="/about" className="hover:text-zinc-400 transition-colors">O nás</Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">Podmínky</Link>
            <Link href="/help" className="hover:text-zinc-400 transition-colors">Centrum nápovědy</Link>
          </div>
          <p className="mt-4 opacity-50 uppercase tracking-widest font-black">© 2024 3Play</p>
        </div>
      </div>
    </aside>
  );
}
