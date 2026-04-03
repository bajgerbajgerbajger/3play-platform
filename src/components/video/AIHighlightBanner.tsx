'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Volume2, VolumeX, Sparkles, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Highlight {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  videoUrl: string;
  backdropUrl: string;
}

export function AIHighlightBanner() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await fetch('/api/highlights');
        const data = await res.json();
        setHighlights(data);
      } catch (error) {
        console.error('Failed to fetch AI highlights:', error);
      }
    };
    fetchHighlights();
  }, []);

  useEffect(() => {
    if (highlights.length === 0) return;

    const current = highlights[currentIndex];
    if (videoRef.current) {
      videoRef.current.currentTime = current.startTime;
      videoRef.current.play().catch(e => console.log("Autoplay blocked", e));
      setIsPlaying(true);
    }

    // Set a timer to switch to the next highlight when this one ends
    const duration = (current.endTime - current.startTime) * 1000;
    const timer = setTimeout(() => {
      handleNext();
    }, Math.max(duration, 10000)); // Play for at least 10s or until endTime

    return () => clearTimeout(timer);
  }, [currentIndex, highlights]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
    setIsLoading(true);
  };

  const current = highlights[currentIndex];

  if (highlights.length === 0 || !current) return null;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black group/ai-banner" suppressHydrationWarning>
      {/* Background Video */}
      <div className="absolute inset-0" suppressHydrationWarning>
        <video
          ref={videoRef}
          src={`${current.videoUrl}#t=${current.startTime},${current.endTime}`}
          autoPlay
          muted={isMuted}
          playsInline
          preload="metadata"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onCanPlay={() => setIsLoading(false)}
          onEnded={handleNext}
          onError={(e) => {
            // Silently handle common browser abort/network errors during navigation/preview
            const error = e.currentTarget.error;
            if (error && (error.code === 4 || error.message?.includes('abort') || error.message?.includes('network'))) {
              return;
            }
            console.log('AI highlight banner video status:', error);
          }}
        />
        
        {/* Loading/Backdrop fallback */}
        {isLoading && current.backdropUrl && (
          <Image
            src={current.backdropUrl}
            alt={current.title}
            fill
            className="object-cover animate-pulse"
          />
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent z-10" suppressHydrationWarning />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" suppressHydrationWarning />
      </div>

      {/* AI Indicator */}
      <div className="absolute top-24 left-4 sm:left-12 z-30 flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-600/30 rounded-full backdrop-blur-md animate-pulse">
        <Sparkles className="w-4 h-4 text-red-500" />
        <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">AI Live Highlights</span>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center z-20 px-4 sm:px-6 lg:px-12" suppressHydrationWarning>
        <div className="max-w-2xl space-y-6" suppressHydrationWarning>
          <div className="flex items-center gap-2" suppressHydrationWarning>
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
              {current.title}
            </h1>
            <p className="text-lg sm:text-xl text-zinc-300 font-medium line-clamp-2 drop-shadow-lg">
              {current.description}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href={`/watch/${current.id}`}>
              <Button size="lg" className="bg-white hover:bg-zinc-200 text-black font-bold px-8 h-14 rounded-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
                <Play className="w-6 h-6 fill-current" />
                Watch Full Movie
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-zinc-900/40 border-zinc-700/50 hover:bg-zinc-800/60 text-white font-bold h-14 rounded-2xl flex items-center gap-3 backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
            >
              <Info className="w-6 h-6" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 right-12 z-30 flex items-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-4 bg-zinc-900/40 border border-zinc-700/50 rounded-2xl text-white backdrop-blur-md hover:bg-zinc-800/60 transition-all hover:scale-110 active:scale-90"
        >
          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-1.5 h-1.5">
          {highlights.map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-8 h-full rounded-full transition-all duration-500",
                i === currentIndex ? "bg-red-600 w-12" : "bg-zinc-700"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
