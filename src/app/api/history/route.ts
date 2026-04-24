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

    const items = await db.watchHistory.findMany({
      where: { userId: user.id },
      include: {
        movie: { include: { genres: true, cast: true, crew: true } },
        episode: {
          include: {
            season: { include: { series: { include: { genres: true, cast: true, crew: true } } } },
          },
        },
      },
      orderBy: { watchedAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

