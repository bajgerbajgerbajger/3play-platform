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
      ...(genre && genre !== 'all' && { genres: { some: { slug: genre } } }),
      ...(year && year !== 'all' && { releaseYear: parseInt(year) }),
    };

    const orderBy =
      sort === 'rating'
        ? { averageRating: 'desc' as const }
        : sort === 'newest'
          ? { releaseYear: 'desc' as const }
          : sort === 'oldest'
            ? { releaseYear: 'asc' as const }
            : sort === 'title'
              ? { title: 'asc' as const }
              : { viewCount: 'desc' as const };

    const [movies, total] = await Promise.all([
      db.movie.findMany({
        where,
        include: {
          genres: true,
          cast: { orderBy: { order: 'asc' }, take: 5 },
          crew: { take: 5 },
        },
        orderBy,
        take: limit,
        skip,
      }),
      db.movie.count({ where }),
    ]);

    return NextResponse.json({
      movies,
      total,
      page,
      pageSize: limit,
      hasMore: skip + movies.length < total,
    });
  } catch (error) {
    console.error('[MOVIES_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
