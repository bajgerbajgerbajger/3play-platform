import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get('seasonId');
    const seriesSlug = searchParams.get('seriesSlug');
    const seriesId = searchParams.get('seriesId');

    if (!seasonId && !seriesSlug && !seriesId) {
      return NextResponse.json(
        { error: 'seasonId, seriesSlug, or seriesId is required' },
        { status: 400 }
      );
    }

    if (seasonId) {
      const episodes = await db.episode.findMany({
        where: { seasonId, isPublished: true },
        orderBy: { episodeNumber: 'asc' },
      });
      return NextResponse.json({ episodes, total: episodes.length });
    }

    // Resolve series by slug if needed
    let resolvedSeriesId = seriesId;
    if (seriesSlug && !resolvedSeriesId) {
      const series = await db.series.findUnique({ where: { slug: seriesSlug } });
      if (!series) {
        return NextResponse.json({ error: 'Series not found' }, { status: 404 });
      }
      resolvedSeriesId = series.id;
    }

    const seasons = await db.season.findMany({
      where: { seriesId: resolvedSeriesId! },
      orderBy: { seasonNumber: 'asc' },
      include: {
        episodes: {
          where: { isPublished: true },
          orderBy: { episodeNumber: 'asc' },
        },
      },
    });

    const episodes = seasons.flatMap((s) => s.episodes);

    return NextResponse.json({
      seasons,
      episodes,
      total: episodes.length,
    });
  } catch (error) {
    console.error('[EPISODES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
