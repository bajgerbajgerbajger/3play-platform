import { MainLayout } from '@/components/layout/MainLayout';
import { HeroBanner } from '@/components/video/HeroBanner';
import { AIHighlightBanner } from '@/components/video/AIHighlightBanner';
import { ContentRow } from '@/components/video/ContentRow';
import { db } from '@/lib/db';

async function getHomePageData() {
  try {
    const [highlights, featured, newlyAdded, trending, popularMovies, popularSeries, topRated] = await Promise.all([
      // AI Highlights
      db.highlight.count().catch(() => 0),
      // Featured content (for hero banner)
      db.movie.findMany({
        where: { isPublished: true },
        orderBy: { viewCount: 'desc' },
        take: 5,
        include: { genres: true, cast: true, crew: true },
      }).catch(() => []),
      // Newly Added (Sorted by database creation time)
      db.movie.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { genres: true, cast: true, crew: true },
      }).catch(() => []),
      // Trending
      db.movie.findMany({
        where: { isPublished: true },
        orderBy: { viewCount: 'desc' },
        take: 10,
        include: { genres: true, cast: true, crew: true },
      }).catch(() => []),
      // Popular Movies
      db.movie.findMany({
        where: { isPublished: true },
        orderBy: { viewCount: 'desc' },
        take: 10,
        include: { genres: true, cast: true, crew: true },
      }).catch(() => []),
      // Popular Series
      db.series.findMany({
        where: { isPublished: true },
        orderBy: { viewCount: 'desc' },
        take: 10,
        include: { genres: true, cast: true, seasons: { include: { episodes: true } } },
      }).catch(() => []),
      // Top Rated
      db.movie.findMany({
        where: { isPublished: true, averageRating: { gte: 7 } },
        orderBy: { averageRating: 'desc' },
        take: 10,
        include: { genres: true, cast: true, crew: true },
      }).catch(() => []),
    ]);

    return {
      hasHighlights: highlights > 0,
      featured,
      newlyAdded,
      trending,
      popularMovies,
      popularSeries,
      topRated,
    };
  } catch (error) {
    console.error('Failed to fetch home page data:', error);
    return {
      hasHighlights: false,
      featured: [],
      newlyAdded: [],
      trending: [],
      popularMovies: [],
      popularSeries: [],
      topRated: [],
      error: 'Database connection failed. Please check your database status.'
    };
  }
}

export default async function HomePage() {
  const data = await getHomePageData();

  if ('error' in data) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">3Play Infrastructure Offline</h2>
            <p className="text-zinc-400">
              Systém nemůže navázat spojení s centrální databází. Zkontrolujte stav XAMPP (MySQL) a konfiguraci sítě.
            </p>
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 text-left">
              <p className="text-sm font-semibold text-zinc-300 mb-2 underline decoration-red-600 underline-offset-4">Diagnostické kroky:</p>
              <ul className="text-xs text-zinc-500 list-disc list-inside space-y-1">
                <li>Ujistěte se, že MySQL v XAMPP Control Panelu svítí zeleně</li>
                <li>Zkontrolujte, zda port 3306 není blokován firewallem</li>
                <li>Ověřte <code className="bg-black px-1 rounded text-zinc-300">DATABASE_URL</code> v souboru <code className="bg-black px-1 rounded text-zinc-300">.env</code></li>
                <li>Restartujte 3Play Manager</li>
              </ul>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pb-8 space-y-12" suppressHydrationWarning>
        {/* Banner Section */}
        {data.hasHighlights ? (
          <AIHighlightBanner />
        ) : (
          <HeroBanner items={data.featured} />
        )}

        {/* Content Rows */}
        <div className={data.hasHighlights ? "px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12 pb-12" : "-mt-16 relative z-10 space-y-6 pb-12"} suppressHydrationWarning>
          <ContentRow
            title="Newly Added"
            items={data.newlyAdded}
          />

          <ContentRow
            title="Trending Now"
            items={data.trending}
          />

          <ContentRow
            title="Popular Movies"
            items={data.popularMovies}
          />

          <ContentRow
            title="Popular Series"
            items={data.popularSeries}
          />

          <ContentRow
            title="Top Rated"
            items={data.topRated}
            variant="portrait"
          />
        </div>
      </div>
    </MainLayout>
  );
}
