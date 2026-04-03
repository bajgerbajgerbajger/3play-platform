import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const genre = searchParams.get('genre');
    const year = searchParams.get('year');
    const sort = searchParams.get('sort') || 'popularity';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(genre && genre !== 'all' && {
        genres: { some: { slug: genre } },
      }),
      ...(year && year !== 'all' && {
        startYear: { lte: parseInt(year) },
        OR: [
          { endYear: null },
          { endYear: { gte: parseInt(year) } },
        ],
      }),
    };

    const orderBy =
      sort === 'rating'
        ? { averageRating: 'desc' as const }
        : sort === 'newest'
          ? { startYear: 'desc' as const }
          : sort === 'oldest'
            ? { startYear: 'asc' as const }
            : sort === 'title'
              ? { title: 'asc' as const }
              : { viewCount: 'desc' as const };

    const [series, total] = await Promise.all([
      db.series.findMany({
        where,
        include: {
          genres: true,
          cast: { orderBy: { order: 'asc' }, take: 5 },
          crew: true,
          seasons: {
            include: {
              episodes: {
                select: {
                  id: true,
                  episodeNumber: true,
                  title: true,
                  duration: true,
                },
              },
            },
            orderBy: { seasonNumber: 'asc' },
          },
        },
        orderBy,
        take: limit,
        skip,
      }),
      db.series.count({ where }),
    ]);

    return NextResponse.json({
      series,
      total,
      page,
      pageSize: limit,
      hasMore: skip + series.length < total,
    });
  } catch (error) {
    console.error('[SERIES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
