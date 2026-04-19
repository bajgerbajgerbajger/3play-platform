import { BrowseFilters } from '@/components/browse/BrowseFilters';
import { MainLayout } from '@/components/layout/MainLayout';
import { VideoCard } from '@/components/video/VideoCard';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

async function getGenres() {
  return db.genre.findMany({
    orderBy: { name: 'asc' },
  });
}

async function getContent(
  type?: string | null,
  genre?: string | null,
  year?: string | null,
  sort?: string | null
) {
  type MovieItem = Prisma.MovieGetPayload<{ include: { genres: true; cast: true; crew: true } }>;
  type SeriesItem = Prisma.SeriesGetPayload<{
    include: { genres: true; cast: true; crew: true; seasons: { include: { episodes: true } } };
  }>;

  let movies: MovieItem[] = [];
  let series: SeriesItem[] = [];

  if (!type || type === 'all' || type === 'movie') {
    movies = await db.movie.findMany({
      where: {
        isPublished: true,
        ...(genre && genre !== 'all' && { genres: { some: { slug: genre } } }),
        ...(year && year !== 'all' && { releaseYear: parseInt(year) }),
      },
      include: { genres: true, cast: true, crew: true },
      orderBy:
        sort === 'rating'
          ? { averageRating: 'desc' }
          : sort === 'newest'
            ? { releaseYear: 'desc' }
            : { viewCount: 'desc' },
      take: 20,
    });
  }

  if (!type || type === 'all' || type === 'series') {
    series = await db.series.findMany({
      where: {
        isPublished: true,
        ...(genre && genre !== 'all' && { genres: { some: { slug: genre } } }),
      },
      include: {
        genres: true,
        cast: true,
        crew: true,
        seasons: { include: { episodes: true } },
      },
      orderBy:
        sort === 'rating'
          ? { averageRating: 'desc' }
          : sort === 'newest'
            ? { startYear: 'desc' }
            : { viewCount: 'desc' },
      take: 20,
    });
  }

  return [...movies, ...series];
}

interface BrowsePageProps {
  searchParams: Promise<{ type?: string; genre?: string; year?: string; sort?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const resolvedParams = await searchParams;
  const genres = await getGenres();
  const content = await getContent(
    resolvedParams.type,
    resolvedParams.genre,
    resolvedParams.year,
    resolvedParams.sort
  );

  return (
    <MainLayout>
      <div className="pb-8">
        {/* Browse Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-zinc-800">
          <h1 className="text-3xl font-bold text-white">Browse</h1>
          <p className="text-zinc-400 mt-1">Explore all movies and TV series</p>
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <BrowseFilters genres={genres} />
        </Suspense>

        {/* Content Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {content.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {content.map((item) => (
                <VideoCard key={item.id} content={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400">No content found matching your filters</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
