import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { contentId, episodeId, progress, duration } = await req.json();

    if (!contentId && !episodeId) {
      return NextResponse.json(
        { error: 'contentId or episodeId is required' },
        { status: 400 }
      );
    }

    // Validate progress is non-negative and within bounds
    if (typeof progress !== 'number' || progress < 0 || !Number.isFinite(progress)) {
      return NextResponse.json(
        { error: 'Invalid progress value' },
        { status: 400 }
      );
    }

    if (typeof duration !== 'number' || duration <= 0 || !Number.isFinite(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration value' },
        { status: 400 }
      );
    }

    // Update watch history
    if (contentId) {
      await db.watchHistory.upsert({
        where: {
          userId_movieId: { userId: user.id, movieId: contentId },
        },
        create: {
          userId: user.id,
          movieId: contentId,
          progress: Math.floor(progress),
          duration: Math.floor(duration),
          completed: progress >= duration * 0.9,
        },
        update: {
          progress: Math.floor(progress),
          duration: Math.floor(duration),
          completed: progress >= duration * 0.9,
          watchedAt: new Date(),
        },
      });

      // Update continue watching
      await db.continueWatching.upsert({
        where: {
          userId_movieId: { userId: user.id, movieId: contentId },
        },
        create: {
          userId: user.id,
          movieId: contentId,
          progress: Math.floor(progress),
          duration: Math.floor(duration),
        },
        update: {
          progress: Math.floor(progress),
          duration: Math.floor(duration),
        },
      });
    }

    // Update watch history for episodes
    if (episodeId) {
      const episode = await db.episode.findUnique({
        where: { id: episodeId },
        include: { season: true },
      });

      if (!episode) {
        return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
      }

      await db.watchHistory.upsert({
        where: {
          userId_episodeId: { userId: user.id, episodeId },
        },
        create: {
          userId: user.id,
          episodeId,
          progress: Math.floor(progress),
          duration: Math.floor(duration),
          completed: progress >= duration * 0.9,
        },
        update: {
          progress: Math.floor(progress),
          duration: Math.floor(duration),
          completed: progress >= duration * 0.9,
          watchedAt: new Date(),
        },
      });

      // Update continue watching
      await db.continueWatching.upsert({
        where: {
          userId_episodeId: { userId: user.id, episodeId },
        },
        create: {
          userId: user.id,
          seriesId: episode.season.seriesId,
          episodeId,
          progress: Math.floor(progress),
          duration: Math.floor(duration),
        },
        update: {
          progress: Math.floor(progress),
          duration: Math.floor(duration),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
