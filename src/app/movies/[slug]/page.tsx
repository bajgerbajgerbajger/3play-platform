import Link from 'next/link';
import Image from 'next/image';
import { Share, ThumbsUp, Star } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContentRow } from '@/components/video/ContentRow';
import { MovieHero } from '@/components/video/MovieHero';
import { db } from '@/lib/db';
import type { Movie as MovieType } from '@/types';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getMovie(slug: string) {
  const movie = await db.movie.findUnique({
    where: { slug },
    include: {
      genres: true,
      cast: { orderBy: { order: 'asc' } },
      crew: true,
      highlights: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!movie) return null;

  return movie;
}

async function getRelatedMovies(movieId: string, genreIds: string[]) {
  return db.movie.findMany({
    where: {
      id: { not: movieId },
      isPublished: true,
      genres: { some: { id: { in: genreIds } } },
    },
    include: { genres: true, cast: true, crew: true },
    take: 10,
  });
}

interface MoviePageProps {
  params: Promise<{ slug: string }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    notFound();
  }

  const relatedMovies = await getRelatedMovies(
    movie.id,
    movie.genres.map((g) => g.id)
  );

  return (
    <MainLayout>
      <div className="pb-8">
        <MovieHero movie={movie as unknown as MovieType} />

        {/* Best Moments / Highlights */}
        {movie.highlights && movie.highlights.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Best Moments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {movie.highlights.map((highlight) => (
                <div key={highlight.id} className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all" suppressHydrationWarning>
                  <video 
                    src={movie.videoUrl ? `${movie.videoUrl}#t=${highlight.startTime}` : ''} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" suppressHydrationWarning />
                  <div className="absolute bottom-3 left-3 right-3" suppressHydrationWarning>
                    <p className="text-white text-sm font-bold truncate" suppressHydrationWarning>{highlight.title}</p>
                    <p className="text-zinc-400 text-xs line-clamp-1" suppressHydrationWarning>{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast & Crew */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Cast</h2>
              <div className="grid grid-cols-2 gap-3">
                {movie.cast.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-400 text-sm">{member.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{member.name}</p>
                      {member.character && (
                        <p className="text-zinc-500 text-xs">as {member.character}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Crew</h2>
              <div className="space-y-3">
                {movie.crew.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-zinc-400 text-sm">{member.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{member.name}</p>
                      <p className="text-zinc-500 text-xs capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Content */}
        {relatedMovies.length > 0 && (
          <ContentRow
            title="More Like This"
            items={relatedMovies}
          />
        )}
      </div>
    </MainLayout>
  );
}
