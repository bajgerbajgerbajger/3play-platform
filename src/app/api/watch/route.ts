import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const episodeId = searchParams.get('episodeId');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Check if it's a movie or series
    const movie = await db.movie.findUnique({
      where: { slug },
      include: { genres: true },
    });

    if (movie) {
      // Get progress if user is logged in
      let progress = 0;
      const session = await getServerSession(authOptions);
      if (session?.user?.email) {
        const user = await db.user.findUnique({
          where: { email: session.user.email },
        });
        if (user) {
          const history = await db.watchHistory.findUnique({
            where: { userId_movieId: { userId: user.id, movieId: movie.id } },
          });
          progress = history?.progress || 0;
        }
      }

      // Get related movies
      const relatedContent = await db.movie.findMany({
        where: {
          id: { not: movie.id },
          isPublished: true,
          genres: { some: { id: { in: movie.genres.map((g) => g.id) } } },
        },
        take: 5,
      });

      return NextResponse.json({
        content: movie,
        relatedContent,
        progress,
      });
    }

    // Check for series
    const series = await db.series.findUnique({
      where: { slug },
      include: {
        genres: true,
        seasons: {
          include: { episodes: true },
          orderBy: { seasonNumber: 'asc' },
        },
      },
    });

    if (series) {
      let progress = 0;
      let nextEpisode = null;

      const session = await getServerSession(authOptions);
      if (session?.user?.email && episodeId) {
        const user = await db.user.findUnique({
          where: { email: session.user.email },
        });
        if (user) {
          const history = await db.watchHistory.findUnique({
            where: { userId_episodeId: { userId: user.id, episodeId } },
          });
          progress = history?.progress || 0;
        }
      }

      if (episodeId) {
        const currentEpisode = series.seasons
          .flatMap((s) => s.episodes)
          .find((e) => e.id === episodeId);

        if (currentEpisode) {
          const currentSeasonIndex = series.seasons.findIndex(
            (s) => s.id === currentEpisode.seasonId
          );
          const currentEpisodeIndex = series.seasons[currentSeasonIndex].episodes.findIndex(
            (e) => e.id === currentEpisode.id
          );

          if (currentEpisodeIndex < series.seasons[currentSeasonIndex].episodes.length - 1) {
            nextEpisode =
              series.seasons[currentSeasonIndex].episodes[currentEpisodeIndex + 1];
          } else if (currentSeasonIndex < series.seasons.length - 1) {
            nextEpisode = series.seasons[currentSeasonIndex + 1].episodes[0];
          }
        }
      }

      // Get related series
      const relatedContent = await db.series.findMany({
        where: {
          id: { not: series.id },
          isPublished: true,
          genres: { some: { id: { in: series.genres.map((g) => g.id) } } },
        },
        take: 5,
      });

      return NextResponse.json({
        content: series,
        relatedContent,
        nextEpisode,
        progress,
      });
    }

    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  } catch (error) {
    console.error('Error fetching watch data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
