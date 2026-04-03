'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Play, Plus, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Movie, Series } from '@/types';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  items: (Movie | Series)[];
}

export function HeroBanner({ items }: HeroBannerProps) {
  const { data: session } = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [randomStartTime, setRandomStartTime] = useState(180);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const blinkOverlayRef = useRef<HTMLDivElement>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsLoading(true);
    setShowVideo(false);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsLoading(true);
    setShowVideo(false);
  }, [items.length]);

  const handleLoadedMetadata = async () => {
    setIsLoading(false);
    const item = items[currentIndex];
    
    // Only admins can auto-update duration
    const isAdmin = (session?.user as any)?.role === 'ADMIN';

    if (videoRef.current && item && (!item.duration || item.duration === 0) && !durations[item.id] && isAdmin) {
      const durationInMinutes = Math.floor(videoRef.current.duration / 60);
      if (durationInMinutes > 0) {
        setDurations(prev => ({ ...prev, [item.id]: durationInMinutes }));
        try {
          await fetch('/api/movies/update-duration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id, duration: durationInMinutes }),
          });
        } catch (error) {
          console.error('Failed to auto-update duration:', error);
        }
      }
    }
  };

  // Generate a random start time (between 10% and 80% of duration if known, else random minutes)
  const randomizeScene = useCallback((duration?: number) => {
    const item = items[currentIndex];
    const totalMinutes = duration || durations[item?.id] || 120; // Default to 2 hours
    const startMin = Math.floor(totalMinutes * 0.1); // Skip intro
    const endMin = Math.floor(totalMinutes * 0.8); // Avoid credits
    const randomSec = Math.floor(Math.random() * (endMin - startMin) * 60) + (startMin * 60);
    
    // If we have a video ref and it's already playing, just jump the time for a "fast blink"
    if (videoRef.current && showVideo) {
      // Trigger blink effect
      if (blinkOverlayRef.current) {
        blinkOverlayRef.current.style.opacity = '1';
        setTimeout(() => {
          if (blinkOverlayRef.current) blinkOverlayRef.current.style.opacity = '0';
        }, 150);
      }
      videoRef.current.currentTime = randomSec;
    } else {
      setRandomStartTime(randomSec);
    }
  }, [showVideo, currentIndex, items, durations]);

  useEffect(() => {
    if (items.length === 0) return;
    
    const timer = setInterval(goToNext, 20000); // More time per slide

    return () => clearInterval(timer);
  }, [items.length, goToNext]);

  // Handle slide change
  useEffect(() => {
    const item = items[currentIndex];
    
    // Initial random scene for new slide
    const totalMinutes = item?.duration || durations[item?.id] || 120;
    const startMin = Math.floor(totalMinutes * 0.1);
    const endMin = Math.floor(totalMinutes * 0.8);
    const initialRandomSec = Math.floor(Math.random() * (endMin - startMin) * 60) + (startMin * 60);
    
    // Use timeout to avoid synchronous setState warning
    const stateTimer = setTimeout(() => {
      setRandomStartTime(initialRandomSec);
    }, 0);
    
    // Much faster video transition (from 2s to 0.5s)
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 500);

    // Periodically jump to a new random scene within the same video
    const sceneTimer = setInterval(() => {
      if (showVideo) {
        // No loading or hide video when just jumping scenes, just a quick blink
        randomizeScene(item?.duration);
      }
    }, 12000); // Jump every 12 seconds for variety

    return () => {
      clearTimeout(stateTimer);
      clearTimeout(timer);
      clearInterval(sceneTimer);
    };
  }, [currentIndex, items, showVideo, randomizeScene, durations]);

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const isSeries = 'seasons' in currentItem;
  const href = isSeries ? `/series/${currentItem.slug}` : `/movies/${currentItem.slug}`;

  // Get preview video URL
  const getPreviewUrl = () => {
    if (!isSeries) {
      return (currentItem as Movie).videoUrl || (currentItem as Movie).trailerUrl;
    }
    const series = currentItem as Series;
    if (series.seasons?.[0]?.episodes?.[0]?.videoUrl) {
      return series.seasons[0].episodes[0].videoUrl;
    }
    return null;
  };

  const previewUrl = getPreviewUrl();

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
    setShowVideo(false);
  };

  return (
    <div className="relative h-[65vh] min-h-[450px] max-h-[750px] w-full group/banner overflow-hidden rounded-3xl" suppressHydrationWarning>
      {/* Background Media */}
      <div className="absolute inset-0 overflow-hidden" suppressHydrationWarning>
        {/* Static Image */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-700",
          showVideo && previewUrl ? "opacity-0" : "opacity-100"
        )} suppressHydrationWarning>
          {currentItem.backdropUrl ? (
            <Image
              src={currentItem.backdropUrl}
              alt={currentItem.title}
              fill
              priority
              className="object-cover"
              onLoad={() => setIsLoading(false)}
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" suppressHydrationWarning />
          )}
        </div>

        {/* Background Video */}
        {showVideo && previewUrl && (
          <div className="absolute inset-0 z-0 animate-in fade-in duration-500" suppressHydrationWarning>
            <video
              ref={videoRef}
              key={`${currentIndex}`} // Only re-mount when slide changes, not on scene jump
              src={`${previewUrl}#t=${randomStartTime}`}
              autoPlay
              muted={isMuted}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover scale-105 transition-transform duration-[10s] ease-linear group-hover/banner:scale-110"
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => randomizeScene(currentItem.duration)}
              onError={(e) => {
                const error = e.currentTarget.error;
                if (error && (error.code === 4 || error.message?.includes('abort') || error.message?.includes('network'))) {
                  return;
                }
              }}
            />
            {/* Quick Blink Transition Overlay (for scene jumps) */}
            <div 
              ref={blinkOverlayRef}
              className="absolute inset-0 bg-black opacity-0 transition-opacity duration-150 pointer-events-none z-10" 
              suppressHydrationWarning
            />
          </div>
        )}

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent z-10" suppressHydrationWarning />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" suppressHydrationWarning />
        
        {/* Loading Skeleton Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950 z-20 animate-pulse" suppressHydrationWarning />
        )}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end z-20" suppressHydrationWarning>
        <div className="w-full px-6 sm:px-10 lg:px-12 pb-16 max-w-3xl" suppressHydrationWarning>
          <div className="space-y-5" suppressHydrationWarning>
            {/* Badges */}
            <div className="flex items-center gap-3" suppressHydrationWarning>
              {currentItem.isPremium && (
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase shadow-lg shadow-red-600/20">
                  PREMIUM
                </span>
              )}
              <span className="text-zinc-300 text-sm font-bold">
                {isSeries ? 'TV Seriál' : 'Film'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 text-sm font-bold">
                {'releaseYear' in currentItem ? currentItem.releaseYear : currentItem.startYear}
              </span>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-black text-[10px]">
                {currentItem.rating || 'NR'}
              </Badge>
            </div>

            {/* Title */}
            <Link href={href} className="inline-block group/title" suppressHydrationWarning>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl tracking-tighter group-hover/title:text-white/90 transition-all">
                {currentItem.title}
              </h1>
            </Link>

            {/* Description */}
            <p className="text-zinc-300 text-base sm:text-lg line-clamp-2 max-w-2xl drop-shadow-lg font-medium leading-relaxed" suppressHydrationWarning>
              {currentItem.description}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4" suppressHydrationWarning>
              <Link href={href}>
                <Button
                  size="lg"
                  className="bg-red-600 text-white hover:bg-red-500 gap-2 h-14 px-10 text-lg font-black rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95 group/play"
                >
                  <Play className="w-6 h-6 fill-current group-hover/play:scale-110 transition-transform" />
                  PŘEHRÁT
                </Button>
              </Link>

              <Button
                size="lg"
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white gap-2 h-14 px-8 text-lg font-bold rounded-2xl backdrop-blur-md border border-white/10 transition-all"
              >
                <Plus className="w-6 h-6" />
                Můj Seznam
              </Button>
            </div>
          </div>
        </div>

        {/* Sound Toggle Button */}
        <div className="absolute bottom-16 right-8 sm:right-12 z-30 flex items-center gap-3" suppressHydrationWarning>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none" suppressHydrationWarning>
        <button
          onClick={goToPrev}
          className="pointer-events-auto h-12 w-12 rounded-2xl bg-black/20 hover:bg-red-600/80 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={goToNext}
          className="pointer-events-auto h-12 w-12 rounded-2xl bg-black/20 hover:bg-red-600/80 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30" suppressHydrationWarning>
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              index === currentIndex
                ? "w-10 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                : "w-4 bg-white/20 hover:bg-white/40"
            )}
            aria-label={`Go to slide ${index + 1}`}
            suppressHydrationWarning
          />
        ))}
      </div>
    </div>
  );
}
