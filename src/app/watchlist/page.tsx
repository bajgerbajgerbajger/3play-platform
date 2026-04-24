import { MainLayout } from '@/components/layout/MainLayout';
import { VideoCard } from '@/components/video/VideoCard';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getWatchlist() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return [];

  const items = await db.watchlist.findMany({
    where: { userId: user.id },
    include: {
      movie: { include: { genres: true, cast: true, crew: true } },
      series: {
        include: {
          genres: true,
          cast: true,
          crew: true,
          seasons: { include: { episodes: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return items
    .map((item) => item.movie ?? item.series)
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const items = await getWatchlist();

  return (
    <MainLayout>
      <div className="pb-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8 border-b border-zinc-800 mb-8">
          <h1 className="text-3xl font-bold text-white">My Watchlist</h1>
          <p className="text-zinc-400 mt-1">
            {items.length > 0
              ? `${items.length} title${items.length !== 1 ? 's' : ''} saved`
              : 'Nothing saved yet'}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <VideoCard key={item.id} content={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-9 h-9 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-zinc-400 mb-6 max-w-sm">
              Browse movies and series and add them to your watchlist to watch
              later.
            </p>
            <a
              href="/browse"
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Browse Content
            </a>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
