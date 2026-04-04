'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus } from 'lucide-react';
import { Movie, Series } from '@/types';
import { cn } from '@/lib/utils';

interface VideoCardProps {
  content: Movie | Series;
  showProgress?: boolean;
  progress?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'portrait';
}

export function VideoCard({
  content,
  showProgress,
  progress,
  className,
  variant = 'default',
}: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compactProgressRef = useRef<HTMLDivElement>(null);
  const defaultProgressRef = useRef<HTMLDivElement>(null);

  const isSeries = 'seasons' in content;
  const href = isSeries ? `/series/${content.slug}` : `/movies/${content.slug}`;

  // Update progress bar width via ref to avoid inline style warnings
  useEffect(() => {
    if (compactProgressRef.current && progress !== undefined) {
      compactProgressRef.current.style.width = `${progress}%`;
    }
  }, [progress, variant]);

  useEffect(() => {
    if (defaultProgressRef.current && progress !== undefined) {
      defaultProgressRef.current.style.width = `${progress}%`;
    }
  }, [progress, variant]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const [previewStartTime, setPreviewStartTime] = useState(180);

  const handleMouseEnter = () => {
    // Randomize preview start time (somewhere in the first 10-50% of the movie if possible)
    // For now, let's just pick a random minute
    setPreviewStartTime(Math.floor(Math.random() * 600) + 60); 
    
    previewTimerRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 200); 
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  };

  // Get preview video URL (movie video or trailer, or trailer for series)
  const getPreviewUrl = () => {
    if (!isSeries) {
      return (content as Movie).videoUrl || (content as Movie).trailerUrl;
    }
    // For series, use trailer URL only (episodes data not reliably included in card)
    const series = content as Series;
    return series.trailerUrl || null;
  };

  const previewUrl = getPreviewUrl();

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return 'TBA';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className={cn(
          'group flex gap-3 p-2 rounded-lg hover:bg-zinc-900 transition-colors',
          className
        )}
      >
        <div className="relative shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-zinc-900">
          {content.posterUrl ? (
            <Image
              src={content.posterUrl}
              alt={content.title}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : !isSeries && (content as Movie).videoUrl ? (
            <video
              src={`${(content as Movie).videoUrl}#t=300`}
              className="w-full h-full object-cover opacity-60"
              muted
              playsInline
              preload="metadata"
              onError={(e) => {
                // Silently handle common browser abort/network errors
                const error = e.currentTarget.error;
                if (error && (error.code === 4 || error.message?.includes('abort') || error.message?.includes('network'))) {
                  return;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <Play className="w-8 h-8 opacity-20" />
            </div>
          )}
          {showProgress && progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
              <div
                ref={compactProgressRef}
                className="h-full bg-red-600"
              />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white line-clamp-2">{content.title}</h4>
          <p className="text-sm text-zinc-500 mt-1">
            {isSeries ? `${content.totalSeasons} Seasons` : formatDuration(content.duration)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'default') {
    return (
      <div
        className={cn(
          'group relative aspect-video bg-zinc-900 border border-zinc-800 overflow-hidden transition-all duration-500 hover:border-red-600/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={href} className="block w-full h-full">
          <Image
            src={content.backdropUrl || content.posterUrl || ''}
            alt={content.title}
            fill
            className={cn(
              'object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-40',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Infrastructure Overlay */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest bg-red-600/10 px-2 py-0.5 border border-red-600/20">
                  {isSeries ? 'Series Node' : 'Media Asset'}
                </span>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                {content.title}
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500">
                <span>ID: {content.slug.slice(0, 8)}</span>
                <span>•</span>
                <span>{isSeries ? 'Multi-Part' : formatDuration(content.duration)}</span>
              </div>
            </div>
          </div>

          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] opacity-20 group-hover:opacity-40 transition-opacity" />
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'group/card block relative rounded-xl overflow-hidden bg-zinc-900 transition-all duration-500 z-0 origin-center',
        'hover:scale-[1.15] hover:z-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)]',
        variant === 'portrait' ? 'aspect-[2/3]' : 'aspect-video',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      suppressHydrationWarning
    >
      {/* Thumbnail */}
      <div className={cn(
        "absolute inset-0 transition-opacity duration-500",
        showPreview ? "opacity-0" : "opacity-100"
      )} suppressHydrationWarning>
        {(variant === 'portrait' ? content.posterUrl : content.backdropUrl || content.posterUrl) ? (
          <Image
            src={(variant === 'portrait' ? content.posterUrl : content.backdropUrl) || content.posterUrl || ''}
            alt={content.title}
            fill
            className={cn(
              'object-cover transition-transform duration-700 group-hover/card:scale-110',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : !isSeries && (content as Movie).videoUrl ? (
          /* Fallback: Show a frame from the video if no image is provided */
          <div className="w-full h-full relative" suppressHydrationWarning>
            <video
              src={`${(content as Movie).videoUrl}#t=300`}
              className="w-full h-full object-cover grayscale-[0.5] opacity-80"
              muted
              playsInline
              preload="metadata"
              onLoadedData={() => setImageLoaded(true)}
              onError={(e) => {
                // Silently handle common browser abort/network errors
                const error = e.currentTarget.error;
                if (error && (error.code === 4 || error.message?.includes('abort') || error.message?.includes('network'))) {
                  return;
                }
              }}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center" suppressHydrationWarning>
              <Play className="w-12 h-12 text-white/50" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900" suppressHydrationWarning>
            <Play className="w-16 h-16 opacity-20" />
          </div>
        )}

        {/* Skeleton loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" suppressHydrationWarning />
        )}
        
        {/* Overlay Gradient for static state */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover/card:opacity-0 transition-opacity" suppressHydrationWarning />
      </div>

      {/* Hover Preview Overlay */}
      {showPreview && previewUrl && (
        <div className="absolute inset-0 z-10 animate-in fade-in zoom-in-105 duration-500" suppressHydrationWarning>
          <video
            src={`${previewUrl}#t=${previewStartTime}`}
            autoPlay
            muted
            playsInline
            loop
            preload="metadata"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Silently handle common browser abort/network errors during navigation/preview
              const error = e.currentTarget.error;
              if (error && (error.code === 4 || error.message?.includes('abort') || error.message?.includes('network'))) {
                return;
              }
              console.log('Video card preview status:', error);
            }}
          />
          {/* Transition Flash Effect */}
          <div className="absolute inset-0 bg-white/5 animate-out fade-out duration-500 pointer-events-none" suppressHydrationWarning />
        </div>
      )}

      {/* Hover Content Overlay */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent transition-all duration-500 flex flex-col justify-end p-4 z-20',
          showPreview ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2 mb-3" suppressHydrationWarning>
          <button
            className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-500 hover:scale-110 transition-all shadow-lg"
            aria-label="Play"
            title="Play"
          >
            <Play className="w-5 h-5 text-white ml-0.5 fill-current" />
          </button>
          <button
            className="w-10 h-10 rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-all shadow-lg"
            aria-label="Add to watchlist"
            title="Add to watchlist"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <h3 className="font-bold text-white text-base line-clamp-1 mb-1" suppressHydrationWarning>{content.title}</h3>
        <div className="flex items-center gap-2 text-[11px] text-zinc-300 font-bold uppercase tracking-wider" suppressHydrationWarning>
          <span className="text-green-500" suppressHydrationWarning>
            {'releaseYear' in content ? content.releaseYear : content.startYear}
          </span>
          <span suppressHydrationWarning>•</span>
          <span suppressHydrationWarning>{isSeries ? `${content.totalSeasons} Řady` : formatDuration(content.duration)}</span>
          {content.rating && (
            <>
              <span suppressHydrationWarning>•</span>
              <span className="border border-zinc-600 px-1.5 py-0.5 rounded-md text-[9px] bg-black/40" suppressHydrationWarning>{content.rating}</span>
            </>
          )}
        </div>

        <div className={cn(
          "overflow-hidden transition-all duration-500",
          showPreview ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0"
        )} suppressHydrationWarning>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed" suppressHydrationWarning>
            {content.description}
          </p>
        </div>
      </div>

      {/* Progress Bar for "Continue Watching" */}
      {showProgress && progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800/80 z-30" suppressHydrationWarning>
          <div
            ref={defaultProgressRef}
            className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)] transition-all duration-500"
          />
        </div>
      )}
    </Link>
  );
}
