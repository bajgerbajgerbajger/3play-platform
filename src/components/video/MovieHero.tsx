'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Play, Plus, Volume2, VolumeX, Clock, Share } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Movie } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MovieHeroProps {
  movie: Movie;
}

export function MovieHero({ movie }: MovieHeroProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [randomStartTime, setRandomStartTime] = useState(180);
  const [currentDuration, setCurrentDuration] = useState(movie.duration || 0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blinkOverlayRef = useRef<HTMLDivElement>(null);

  const handleLoadedMetadata = async () => {
    setIsLoading(false);
    
    // Only admins can auto-update duration
    const isAdmin = (session?.user as { role?: string } | undefined)?.role === 'ADMIN';

    if (videoRef.current && (!currentDuration || currentDuration === 0) && isAdmin) {
      const durationInMinutes = Math.floor(videoRef.current.duration / 60);
      if (durationInMinutes > 0) {
        setCurrentDuration(durationInMinutes);
        try {
          await fetch('/api/movies/update-duration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: movie.id, duration: durationInMinutes }),
          });
        } catch (error) {
          console.error('Failed to auto-update duration:', error);
        }
      }
    }
  };

  const randomizeScene = useCallback((duration?: number) => {
    const totalMinutes = duration || currentDuration || 120;
    const startMin = Math.floor(totalMinutes * 0.1);
    const endMin = Math.floor(totalMinutes * 0.8);
    const randomSec = Math.floor(Math.random() * (endMin - startMin) * 60) + (startMin * 60);
    
    if (videoRef.current && showVideo) {
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
  }, [showVideo, currentDuration]);

  useEffect(() => {
    const totalMinutes = currentDuration || 120;
    const startMin = Math.floor(totalMinutes * 0.1);
    const endMin = Math.floor(totalMinutes * 0.8);
    const initialRandomSec = Math.floor(Math.random() * (endMin - startMin) * 60) + (startMin * 60);
    
    setRandomStartTime(initialRandomSec);
    
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 500);

    const sceneTimer = setInterval(() => {
      if (showVideo) {
        randomizeScene(currentDuration);
      }
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(sceneTimer);
    };
  }, [movie.id, currentDuration, showVideo, randomizeScene]);

  const formatDuration = (minutes: number) => {
    if (!minutes || minutes <= 0) return 'TBA';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const previewUrl = movie.videoUrl || movie.trailerUrl;
  const watchlistLoginHref = `/auth/login?callbackUrl=${encodeURIComponent(`/movies/${movie.slug}`)}`;

  const handleToggleWatchlist = async () => {
    const callbackUrl = `/movies/${movie.slug}`;
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: movie.id, type: 'movie', toggle: true }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setInWatchlist(Boolean(json.inWatchlist));
      toast.success(json.inWatchlist ? 'Přidáno do watchlistu' : 'Odebráno z watchlistu');
    } catch {
      toast.error('Nepodařilo se upravit watchlist');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/movies/${movie.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Odkaz zkopírován');
    } catch {
      toast.error('Nepodařilo se zkopírovat odkaz');
    }
  };

  return (
    <div className="relative h-[65vh] min-h-[450px] w-full group/hero overflow-hidden rounded-3xl" suppressHydrationWarning>
      {/* Background Media */}
      <div className="absolute inset-0" suppressHydrationWarning>
        {/* Static Image Fallback */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-700",
          showVideo && previewUrl ? "opacity-0" : "opacity-100"
        )} suppressHydrationWarning>
          {movie.backdropUrl ? (
            <Image
              src={movie.backdropUrl}
              alt={movie.title}
              fill
              priority
              className="object-cover"
              onLoad={() => setIsLoading(false)}
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-zinc-950" suppressHydrationWarning />
          )}
        </div>

        {/* Video Preview */}
        {showVideo && previewUrl && (
          <div className="absolute inset-0 z-0" suppressHydrationWarning>
            <video
              ref={videoRef}
              src={`${previewUrl}#t=${randomStartTime}`}
              autoPlay
              muted={isMuted}
              playsInline
              preload="metadata"
              className="w-full h-full object-cover scale-105 transition-transform duration-[10s] ease-linear group-hover/hero:scale-110"
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => randomizeScene(currentDuration)}
              onError={(e) => {
                const error = e.currentTarget.error;
                if (error && (error.code === 4 || error.message?.includes('abort') || error.message?.includes('network'))) {
                  return;
                }
              }}
            />
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
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end z-20" suppressHydrationWarning>
        <div className="w-full px-6 sm:px-10 lg:px-12 pb-12" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row gap-8 items-end" suppressHydrationWarning>
            {/* Poster - Skryto na malých hrdinech pro čistší vzhled */}
            <div className="hidden xl:block shrink-0 mb-4" suppressHydrationWarning>
              <div className="relative w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10" suppressHydrationWarning>
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center" suppressHydrationWarning>
                    <Play className="w-12 h-12 text-zinc-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6 pb-2" suppressHydrationWarning>
              <div className="space-y-3" suppressHydrationWarning>
                <div className="flex items-center gap-3 flex-wrap" suppressHydrationWarning>
                  {movie.isPremium && (
                    <Badge className="bg-red-600 text-white font-black px-2.5 py-0.5 rounded-md text-[10px] tracking-widest uppercase" suppressHydrationWarning>PREMIUM</Badge>
                  )}
                  <span className="text-zinc-300 font-bold text-sm" suppressHydrationWarning>{movie.releaseYear}</span>
                  <span className="text-zinc-600" suppressHydrationWarning>•</span>
                  <span className="text-zinc-300 flex items-center gap-1.5 font-bold text-sm" suppressHydrationWarning>
                    <Clock className="w-4 h-4 text-red-600" />
                    {formatDuration(currentDuration || movie.duration)}
                  </span>
                  {movie.rating && (
                    <>
                      <span className="text-zinc-600" suppressHydrationWarning>•</span>
                      <span className="bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-black border border-zinc-700" suppressHydrationWarning>
                        {movie.rating}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl" suppressHydrationWarning>
                  {movie.title}
                </h1>
              </div>

              <p className="text-zinc-300 text-base md:text-lg max-w-2xl line-clamp-2 leading-relaxed drop-shadow-lg font-medium" suppressHydrationWarning>
                {movie.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4" suppressHydrationWarning>
                <Link
                  href={`/watch/${movie.slug}`}
                  className="inline-flex items-center justify-center bg-red-600 text-white hover:bg-red-500 h-14 px-10 text-lg font-black rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95 group/play"
                >
                  <Play className="w-6 h-6 mr-2 fill-current group-hover/play:scale-110 transition-transform" />
                  PŘEHRÁT
                </Link>

                <Link
                  href={watchlistLoginHref}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!session?.user) {
                      window.location.href = watchlistLoginHref;
                      return;
                    }
                    handleToggleWatchlist();
                  }}
                  className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white h-14 px-8 text-lg font-bold rounded-2xl backdrop-blur-md border border-white/10 transition-all"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  {inWatchlist ? 'V Seznamu' : 'Můj Seznam'}
                </Link>

                <div className="flex items-center gap-3 ml-auto" suppressHydrationWarning>
                  <button
                    onClick={handleShare}
                    className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  >
                    <Share className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-950 z-50 flex items-center justify-center" suppressHydrationWarning>
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
