import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const email = session?.user?.email;

  if (!userId && !email) return null;

  if (userId) {
    return db.user.findUnique({ where: { id: userId } });
  }

  return db.user.findUnique({ where: { email: email! } });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await db.continueWatching.findMany({
      where: { userId: user.id },
      include: {
        movie: { include: { genres: true, cast: true, crew: true } },
        series: { include: { genres: true, cast: true, crew: true } },
        episode: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const mapped = items
      .map((item) => {
        const content = item.movie ?? item.series;
        if (!content) return null;
        const pct = item.duration > 0 ? Math.min(100, Math.max(0, Math.round((item.progress / item.duration) * 100))) : 0;
        return {
          id: item.id,
          type: item.movieId ? 'movie' : item.seriesId ? 'series' : 'episode',
          progress: item.progress,
          duration: item.duration,
          percent: pct,
          updatedAt: item.updatedAt,
          content,
          episode: item.episode,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return NextResponse.json({ items: mapped });
  } catch (error) {
    console.error('ContinueWatching GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

