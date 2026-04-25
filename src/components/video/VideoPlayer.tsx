'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import {
    ChevronLeft,
    ChevronRight,
    Maximize,
    Minimize,
    Pause,
    Play,
    Settings,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  autoPlay?: boolean;
  startTime?: number;
}

export function VideoPlayer({
  src,
  poster,
  title,
  onProgress,
  onComplete,
  onNext,
  onPrevious,
  autoPlay = false,
  startTime = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };
  const [buffered, setBuffered] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const bufferProgressRef = useRef<HTMLDivElement>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Update buffer bar width via ref to avoid inline style warnings
  useEffect(() => {
    if (bufferProgressRef.current && duration > 0) {
      const pct = (buffered / duration) * 100;
      bufferProgressRef.current.style.width = `${pct}%`;
    }
  }, [buffered, duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Only set initial time once or when src changes
    if (startTime > 0 && video.currentTime === 0) {
      video.currentTime = startTime;
    }

    const handleTimeUpdate = () => {
      const now = Date.now();
      // Throttle state updates to ~4 times per second for the UI
      if (now - lastUpdateTimeRef.current > 250 || video.ended) {
        setCurrentTime(video.currentTime);
        onProgress?.(video.currentTime, video.duration);
        lastUpdateTimeRef.current = now;
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => {
      setIsBuffering(false);
      setError(null);
    };

    const handleError = () => {
      const video = videoRef.current;
      if (!video) return;
      const mediaError = video.error;
      
      // Ignore common aborted errors during fast navigation
      if (mediaError?.code === mediaError?.MEDIA_ERR_ABORTED) {
        return;
      }

      let message = 'An error occurred while loading the video.';
      
      if (mediaError) {
        switch (mediaError.code) {
          case mediaError.MEDIA_ERR_ABORTED:
            message = 'The video playback was aborted.';
            break;
          case mediaError.MEDIA_ERR_NETWORK:
            message = 'A network error caused the video download to fail.';
            break;
          case mediaError.MEDIA_ERR_DECODE:
            message = 'The video playback was aborted due to a corruption problem or because the video used features your browser did not support.';
            break;
          case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = 'The video format is not supported by your browser.';
            if (src?.endsWith('.mkv')) {
              message += ' MKV files are not supported in most browsers. Please use MP4 (H.264).';
            }
            break;
        }
      }
      setError(message);
      setIsBuffering(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) {
        onNext();
      } else {
        onComplete?.();
      }
    };

    // Reset state when src changes
    setCurrentTime(startTime);
    setIsPlaying(false);
    setBuffered(0);
    lastUpdateTimeRef.current = 0;

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [src, startTime, onProgress, onComplete, onNext]);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromiseRef.current = playPromise;
        playPromise
          .then(() => {
            setIsPlaying(true);
            playPromiseRef.current = null;
          })
          .catch(() => {
            // Autoplay blocked
            playPromiseRef.current = null;
          });
      }
    }
  }, [autoPlay]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      // Ensure we don't interrupt a pending play request
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {
          // Play failed or was already interrupted
        }
      }
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromiseRef.current = playPromise;
          await playPromise;
          setIsPlaying(true);
        }
      } catch (_error) {
        // Play failed or was interrupted
        console.error('Playback failed:', _error);
        setIsPlaying(false);
      } finally {
        playPromiseRef.current = null;
      }
    }
  }, [isPlaying]);

  const handleSeek = (value: number | readonly number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const val = Array.isArray(value) ? value[0] : value;
    if (val === undefined || !Number.isFinite(val)) return;

    const newTime = (val / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = (value: number | readonly number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const val = Array.isArray(value) ? value[0] : value;
    if (val === undefined || !Number.isFinite(val)) return;

    const newVolume = val / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime += seconds;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire shortcuts if typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Check if player contains the focus or the event target
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          skip(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          skip(10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted, togglePlay, toggleFullscreen, toggleMute]);

  return (
    <div
      ref={containerRef}
      className="relative group bg-black aspect-video overflow-hidden transform-gpu"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src || undefined}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
        preload="metadata"
        onError={(e) => {
          // Silently handle common browser abort/network errors
          const error = e.currentTarget.error;
          if (error && (error.code === 4 || error.message?.includes('abort') || error.message?.includes('network'))) {
            return;
          }
          console.error('Video player error:', error);
        }}
      />

      {/* Navigation Overlays */}
      <div
        className={`absolute inset-y-0 left-0 w-24 flex items-center justify-center transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious?.();
          }}
          className="group/nav w-full h-1/2 flex items-center justify-center hover:bg-black/20 transition-all duration-75"
          aria-label="Previous"
        >
          <div className="p-4 rounded-full bg-white/10 group-hover/nav:bg-white/30 group-hover/nav:scale-125 transition-all duration-75 backdrop-blur-sm border border-white/20">
            <ChevronLeft className="w-8 h-8 text-white" />
          </div>
        </button>
      </div>

      <div
        className={`absolute inset-y-0 right-0 w-24 flex items-center justify-center transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          className="group/nav w-full h-1/2 flex items-center justify-center hover:bg-black/20 transition-all duration-75"
          aria-label="Next"
        >
          <div className="p-4 rounded-full bg-white/10 group-hover/nav:bg-white/30 group-hover/nav:scale-125 transition-all duration-75 backdrop-blur-sm border border-white/20">
            <ChevronRight className="w-8 h-8 text-white" />
          </div>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center z-50">
          <div className="max-w-md">
            <p className="text-red-500 font-bold mb-2">Playback Error</p>
            <p className="text-zinc-300 text-sm mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                if (videoRef.current) videoRef.current.load();
              }}
              className="text-white border-white/20 hover:bg-white/10"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Buffering Spinner */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Big Play Button */}
      {!isPlaying && !isBuffering && !error && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/50 transition-all duration-300 group/big-play"
          aria-label="Play"
          title="Play"
        >
          <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center group-hover/big-play:scale-125 group-active/big-play:scale-95 transition-all duration-300 shadow-2xl shadow-red-600/50">
            <Play className="w-12 h-12 text-white ml-1.5" fill="white" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-4 px-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="relative mb-4">
          {/* Buffered Progress */}
          <div
            ref={bufferProgressRef}
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-zinc-600 rounded-full"
          />
          {/* Slider */}
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="relative z-10"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-75"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7" fill="white" />
              ) : (
                <Play className="w-7 h-7" fill="white" />
              )}
            </Button>

            {/* Skip Back */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              className="text-white hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-75"
            >
              <SkipBack className="w-6 h-6" fill="white" />
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              className="text-white hover:bg-white/30 hover:scale-110 active:scale-95 transition-all duration-75"
            >
              <SkipForward className="w-6 h-6" fill="white" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2 group/volume">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/30 hover:scale-110 transition-all duration-75"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </Button>
              <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-300 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed / Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Settings className="w-5 h-5" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white w-40">
                <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase">
                  Playback Speed
                </div>
                {playbackRates.map((rate) => (
                  <DropdownMenuItem
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`cursor-pointer focus:bg-zinc-800 focus:text-white ${
                      playbackRate === rate ? "text-red-500 font-bold" : "text-zinc-300"
                    }`}
                  >
                    {rate === 1 ? 'Normal' : `${rate}x`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      {title && showControls && (
        <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}
    </div>
  );
}
