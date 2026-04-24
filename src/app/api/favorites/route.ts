import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

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

    const items = await db.favorite.findMany({
      where: { userId: user.id },
      include: {
        movie: { include: { genres: true, cast: true, crew: true } },
        series: { include: { genres: true, cast: true, crew: true, seasons: { include: { episodes: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Favorites GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { contentId, type, toggle } = await req.json();
    if (!contentId || (type !== 'movie' && type !== 'series')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (type === 'movie') {
      if (toggle) {
        const existing = await db.favorite.findUnique({
          where: { userId_movieId: { userId: user.id, movieId: contentId } },
        });
        if (existing) {
          await db.favorite.delete({ where: { id: existing.id } });
          return NextResponse.json({ success: true, inFavorites: false });
        }
        await db.favorite.create({ data: { userId: user.id, movieId: contentId } });
        return NextResponse.json({ success: true, inFavorites: true });
      }

      await db.favorite.upsert({
        where: { userId_movieId: { userId: user.id, movieId: contentId } },
        create: { userId: user.id, movieId: contentId },
        update: {},
      });
    } else {
      if (toggle) {
        const existing = await db.favorite.findUnique({
          where: { userId_seriesId: { userId: user.id, seriesId: contentId } },
        });
        if (existing) {
          await db.favorite.delete({ where: { id: existing.id } });
          return NextResponse.json({ success: true, inFavorites: false });
        }
        await db.favorite.create({ data: { userId: user.id, seriesId: contentId } });
        return NextResponse.json({ success: true, inFavorites: true });
      }

      await db.favorite.upsert({
        where: { userId_seriesId: { userId: user.id, seriesId: contentId } },
        create: { userId: user.id, seriesId: contentId },
        update: {},
      });
    }

    return NextResponse.json({ success: true, inFavorites: true });
  } catch (error) {
    console.error('Favorites POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { contentId, type } = await req.json();
    if (!contentId || (type !== 'movie' && type !== 'series')) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const result = await db.favorite.deleteMany({
      where:
        type === 'movie'
          ? { userId: user.id, movieId: contentId }
          : { userId: user.id, seriesId: contentId },
    });

    return NextResponse.json({ success: true, removed: result.count });
  } catch (error) {
    console.error('Favorites DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
