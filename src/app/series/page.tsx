import { MainLayout } from '@/components/layout/MainLayout';
import { VideoCard } from '@/components/video/VideoCard';
import { db } from '@/lib/db';

async function getSeries() {
  return db.series.findMany({
    where: { isPublished: true },
    include: { genres: true, cast: true, crew: true, seasons: { include: { episodes: true } } },
    orderBy: { viewCount: 'desc' },
    take: 50,
  });
}

export default async function SeriesListPage() {
  const series = await getSeries();

  return (
    <MainLayout>
      <div className="pb-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">TV Series</h1>

        {series.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {series.map((s) => (
              <VideoCard key={s.id} content={s} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-400">No series available</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
