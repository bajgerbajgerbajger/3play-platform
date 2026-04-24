'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Movie, Series } from '@/types';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  items: (Movie | Series)[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsLoading(true);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    
    const timer = setInterval(goToNext, 20000); // More time per slide

    return () => clearInterval(timer);
  }, [items.length, goToNext]);

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const handleAddToQueue = () => {
    const item = items[currentIndex];
    if (!item) return;

    const isSeriesItem = 'seasons' in item;
    const firstEpisodeId = isSeriesItem ? (item as Series).seasons?.[0]?.episodes?.[0]?.id : undefined;
    const callbackUrl = firstEpisodeId ? `/watch/${item.slug}/${firstEpisodeId}` : `/watch/${item.slug}`;

    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <div className="relative h-[85vh] w-full bg-black overflow-hidden border-b border-zinc-800">
      {/* Background with Grid/Scanlines */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.05),rgba(0,255,0,0.02),rgba(0,0,255,0.05))] bg-[length:100%_4px,3px_100%] opacity-30 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10" />
        
        {items[currentIndex] && (
          <Image
            src={items[currentIndex].backdropUrl || items[currentIndex].posterUrl || ''}
            alt="Hero"
            fill
            className={cn(
              "object-cover transition-all duration-1000",
              isLoading ? "opacity-0 scale-110" : "opacity-40 scale-100"
            )}
            priority
            onLoad={() => setIsLoading(false)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
      </div>

      {/* Infrastructure UI Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 sm:px-8 lg:px-16">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-700">
            <div className="h-[2px] w-12 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
            <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-[0.3em]">
              System Active // Node {currentIndex + 1}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-left duration-1000 delay-100">
            {items[currentIndex]?.title}
          </h1>

          <p className="text-lg text-zinc-400 font-medium max-w-xl line-clamp-3 animate-in fade-in slide-in-from-left duration-1000 delay-200">
            {items[currentIndex]?.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 animate-in fade-in slide-in-from-top duration-1000 delay-300">
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-none h-14 px-8 shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:scale-105"
              asChild
            >
              <Link href={`/${'seasons' in items[currentIndex] ? 'series' : 'movies'}/${items[currentIndex].slug}`}>
                <Play className="mr-2 h-5 w-5 fill-current" /> Initialize Stream
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-zinc-700 hover:bg-zinc-800 text-white font-bold uppercase tracking-widest rounded-none h-14 px-8"
              onClick={handleAddToQueue}
            >
              <Plus className="mr-2 h-5 w-5" /> Add to Queue
            </Button>
          </div>
        </div>
      </div>

      {/* Terminal-like Status Info */}
      <div className="absolute bottom-8 right-8 z-30 hidden lg:block font-mono text-[10px] text-zinc-500 space-y-1">
        <p>STATUS: OPERATIONAL</p>
        <p>BUFFER: 100%</p>
        <p>UPTIME: {Math.floor(process.uptime())}s</p>
        <p>ENCRYPTION: AES-256</p>
      </div>
    </div>
  );
}
