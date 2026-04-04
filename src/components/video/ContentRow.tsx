'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard } from './VideoCard';
import { Movie, Series } from '@/types';

interface ContentRowProps {
  title: string;
  items: (Movie | Series)[];
  variant?: 'default' | 'portrait';
  showProgress?: boolean;
}

export function ContentRow({ title, items, variant = 'default', showProgress }: ContentRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -container.offsetWidth * 0.8 : container.offsetWidth * 0.8;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <div className="relative group py-12 z-0 hover:z-10 overflow-visible border-t border-zinc-900/50 first:border-t-0" suppressHydrationWarning>
      <div className="flex items-center justify-between mb-8 px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center gap-4">
          <div className="h-8 w-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">{title}</h2>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden sm:block text-[10px] font-mono text-zinc-600 tracking-widest uppercase animate-pulse">
            Data Stream: Active
          </span>
          <Button variant="outline" className="text-zinc-400 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.2em] h-8 px-4 border-zinc-800 rounded-none bg-transparent hover:bg-zinc-900 transition-all">
            Open Archive
          </Button>
        </div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-black via-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-all hover:w-24 flex items-center justify-center border-l border-red-600/0 hover:border-red-600/30 group/arrow"
        >
          <div className="h-12 w-12 flex items-center justify-center bg-black/50 border border-zinc-800 group-hover/arrow:border-red-600/50 transition-colors">
            <ChevronLeft className="h-6 w-6 group-hover/arrow:scale-110 transition-transform" />
          </div>
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 sm:gap-8 overflow-x-auto py-8 -my-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          suppressHydrationWarning
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`flex-shrink-0 transition-transform duration-500 hover:scale-[1.02] relative ${
                variant === 'portrait' ? 'w-44 sm:w-52 lg:w-60' : 'w-72 sm:w-80 lg:w-96'
              }`}
              suppressHydrationWarning
            >
              <div className="absolute -top-4 -left-2 z-10 font-mono text-[10px] text-zinc-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                SEG_{index + 1}
              </div>
              <VideoCard
                content={item}
                variant={variant}
                showProgress={showProgress}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-black via-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-all hover:w-24 flex items-center justify-center border-r border-red-600/0 hover:border-red-600/30 group/arrow"
        >
          <div className="h-12 w-12 flex items-center justify-center bg-black/50 border border-zinc-800 group-hover/arrow:border-red-600/50 transition-colors">
            <ChevronRight className="h-6 w-6 group-hover/arrow:scale-110 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
