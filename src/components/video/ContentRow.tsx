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
    <div className="relative group py-6 z-0 hover:z-10 overflow-visible" suppressHydrationWarning>
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h2>
        <Button variant="link" className="text-zinc-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest">
          Zobrazit vše
        </Button>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-zinc-950 to-transparent text-white opacity-0 group-hover:opacity-100 transition-all hover:w-16 flex items-center justify-center"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto py-8 -my-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          suppressHydrationWarning
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex-shrink-0 transition-transform duration-300 ${
                variant === 'portrait' ? 'w-40 sm:w-48 lg:w-56' : 'w-64 sm:w-72 lg:w-80'
              }`}
              suppressHydrationWarning
            >
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
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-zinc-950 to-transparent text-white opacity-0 group-hover:opacity-100 transition-all hover:w-16 flex items-center justify-center"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}
