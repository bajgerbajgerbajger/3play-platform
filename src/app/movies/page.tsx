import { MainLayout } from '@/components/layout/MainLayout';
import { VideoCard } from '@/components/video/VideoCard';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getMovies() {
  return db.movie.findMany({
    where: { isPublished: true },
    include: { genres: true, cast: true, crew: true },
    orderBy: { viewCount: 'desc' },
    take: 50,
  });
}

export default async function MoviesPage() {
  let movies: Awaited<ReturnType<typeof getMovies>> = [];
  let dbError = false;
  try {
    movies = await getMovies();
  } catch (e) {
    dbError = true;
    console.error('[MOVIES_PAGE_DB]', e);
  }

  return (
    <MainLayout>
      <div className="pb-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Movies</h1>

        {dbError ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Database is starting up. Please refresh.</p>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <VideoCard key={movie.id} content={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-400">No movies available</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
