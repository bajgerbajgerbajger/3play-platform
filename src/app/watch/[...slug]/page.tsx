'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { VideoCard } from '@/components/video/VideoCard';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import type { Episode, Movie, Season, Series } from '@/types';
import { ChevronLeft, Play } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';

interface WatchData {
  content: (Movie & { seasons?: Season[] }) | Series;
  nextEpisode?: Episode & { seasonNumber?: number; episodeNumber?: number };
  relatedContent: (Movie | Series)[];
  progress?: number;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<WatchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const slugArr = Array.isArray(params.slug) ? params.slug : [params.slug];
  const slug = slugArr[0] as string;
  const episodeId = slugArr[1] as string | undefined;

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('slug', slug);
        if (episodeId) queryParams.set('episodeId', episodeId);

        const response = await fetch(`/api/watch?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const result: WatchData = await response.json();
        setData(result);
        setCurrentTime(result.progress ?? 0);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load content';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, episodeId]);

  const handleProgress = async (time: number, duration: number) => {
    setCurrentTime(time);

    if (Math.floor(time) % 10 === 0 && session?.user) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId: data?.content.id,
            episodeId: episodeId ?? null,
            progress: time,
            duration,
          }),
        });
      } catch {
        // Progress save failure is non-critical
      }
    }
  };

  const handleComplete = () => {
    handleNext();
  };

  const handleNext = () => {
    if (isSeries && allEpisodes.length > 1) {
      // Find current episode index
      const currentIndex = allEpisodes.findIndex(e => e.id === episodeId);
      // Play next episode if it exists, otherwise loop to first
      const nextEpisode = allEpisodes[currentIndex + 1] || allEpisodes[0];
      if (nextEpisode) {
        toast.success(`Playing episode: ${nextEpisode.title}`);
        router.push(`/watch/${slug}/${nextEpisode.id}`);
      }
    } else if (data && data.relatedContent.length > 0) {
      // Pick the first related content for better flow, or random
      const nextContent = data.relatedContent[0];
      if (nextContent) {
        toast.success(`Playing next: ${nextContent.title}`);
        router.push(`/watch/${nextContent.slug}`);
      }
    } else {
      // If nothing else, just reload current to simulate "infinite"
      router.refresh();
    }
  };

  const handlePrevious = () => {
    if (isSeries && allEpisodes.length > 1) {
      // Find current episode index
      const currentIndex = allEpisodes.findIndex(e => e.id === episodeId);
      // Play previous episode if it exists, otherwise loop to last
      const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : allEpisodes[allEpisodes.length - 1];
      if (prevEpisode) {
        router.push(`/watch/${slug}/${prevEpisode.id}`);
      }
    } else if (data && data.relatedContent.length > 0) {
      const prevContent = data.relatedContent[data.relatedContent.length - 1];
      if (prevContent) {
        router.push(`/watch/${prevContent.slug}`);
      }
    } else {
      router.back();
    }
  };

  const isSeries = data ? ('seasons' in data.content && Array.isArray(data.content.seasons)) : false;

  const allEpisodes: Episode[] = useMemo(() => {
    if (!data || !isSeries) return [];
    return ((data.content as Series).seasons ?? []).flatMap((s: Season) => s.episodes);
  }, [isSeries, data]);

  const currentEpisode: Episode | undefined = useMemo(() => {
    if (!data || !episodeId) return undefined;
    return allEpisodes.find((e) => e.id === episodeId);
  }, [episodeId, allEpisodes, data]);

  // Find the season number for the current episode
  const currentSeasonNumber: number | undefined = useMemo(() => {
    if (!data || !currentEpisode) return undefined;
    return ((data.content as Series).seasons ?? []).find((s: Season) =>
        s.episodes.some((e) => e.id === currentEpisode.id)
      )?.seasonNumber;
  }, [currentEpisode, data]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 animate-pulse">Loading player...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg font-semibold mb-2">
            {error || 'Content not found'}
          </p>
          <Link href="/" className="text-red-500 hover:text-red-400 text-sm">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const videoSrc =
    currentEpisode?.videoUrl ?? (data.content as Movie).videoUrl ?? '';

  const posterSrc = data.content.backdropUrl ?? data.content.posterUrl ?? undefined;

  const displayTitle = currentEpisode?.title ?? data.content.title;

  const releaseInfo = isSeries
    ? (data.content as Series).startYear
    : (data.content as Movie).releaseYear;

  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer
        src={videoSrc}
        poster={posterSrc}
        title={displayTitle}
        startTime={currentTime}
        onProgress={handleProgress}
        onComplete={handleComplete}
        onNext={handleNext}
        onPrevious={handlePrevious}
        autoPlay
      />

      <div className="max-w-7xl mx-auto p-4 lg:p-6 grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <Link
              href={isSeries ? `/series/${slug}` : `/movies/${slug}`}
              className="text-zinc-400 hover:text-white flex items-center gap-1 mb-2 text-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to {isSeries ? 'Series' : 'Movie'}
            </Link>

            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              {displayTitle}
            </h1>

            {currentEpisode && currentSeasonNumber !== undefined && (
              <p className="text-zinc-400 mt-1 text-sm">
                Season {currentSeasonNumber}, Episode {currentEpisode.episodeNumber}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="text-zinc-300 text-sm">{releaseInfo}</span>
              {data.content.rating && (
                <span className="border border-zinc-600 text-zinc-300 text-xs px-1.5 py-0.5 rounded">
                  {data.content.rating}
                </span>
              )}
              {data.content.genres?.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/browse?genre=${genre.slug}`}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            <p className="text-zinc-300 mt-4 text-sm leading-relaxed">
              {currentEpisode?.description ?? data.content.description}
            </p>
          </div>

          {/* Related / Up Next */}
          {data.relatedContent.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Up Next</h2>
              <div className="space-y-3">
                {data.relatedContent.map((item) => (
                  <VideoCard key={item.id} content={item} variant="compact" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Episodes sidebar */}
        {isSeries && allEpisodes.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 rounded-lg overflow-hidden sticky top-4">
              <h3 className="text-white font-semibold p-4 border-b border-zinc-800">
                Episodes
              </h3>
              <ScrollArea className="h-[420px]">
                <div className="p-2">
                  {allEpisodes.map((episode) => (
                    <Link
                      key={episode.id}
                      href={`/watch/${slug}/${episode.id}`}
                      className={`flex gap-3 p-2 rounded-lg transition-colors ${
                        episodeId === episode.id
                          ? 'bg-zinc-800'
                          : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="relative shrink-0 w-24 aspect-video rounded overflow-hidden bg-zinc-800">
                        {episode.thumbnailUrl ? (
                          <img
                            src={episode.thumbnailUrl}
                            alt={episode.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-zinc-600" />
                          </div>
                        )}
                        {episodeId === episode.id && (
                          <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-2">
                          {episode.episodeNumber}. {episode.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {episode.duration} min
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
