import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Movie, Series, Genre } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';
    const genre = searchParams.get('genre');
    const year = searchParams.get('year');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const searchTerm = query.trim();

    let movies: (Movie & { genres: Genre[] })[] = [];
    let series: (Series & { genres: Genre[] })[] = [];

    if (type === 'all' || type === 'movie') {
      movies = await db.movie.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { synopsis: { contains: searchTerm } },
          ],
          ...(genre && {
            genres: { some: { slug: genre } },
          }),
          ...(year && {
            releaseYear: parseInt(year),
          }),
        },
        include: { genres: true },
        take: limit,
        orderBy:
          sortBy === 'newest'
            ? { releaseYear: 'desc' }
            : sortBy === 'oldest'
              ? { releaseYear: 'asc' }
              : sortBy === 'rating'
                ? { averageRating: 'desc' }
                : sortBy === 'popularity'
                  ? { viewCount: 'desc' }
                  : { title: 'asc' },
      });
    }

    if (type === 'all' || type === 'series') {
      series = await db.series.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { synopsis: { contains: searchTerm } },
          ],
          ...(genre && {
            genres: { some: { slug: genre } },
          }),
          ...(year && {
            startYear: { lte: parseInt(year) },
            endYear: { gte: parseInt(year) },
          }),
        },
        include: { genres: true },
        take: limit,
        orderBy:
          sortBy === 'newest'
            ? { startYear: 'desc' }
            : sortBy === 'oldest'
              ? { startYear: 'asc' }
              : sortBy === 'rating'
                ? { averageRating: 'desc' }
                : sortBy === 'popularity'
                  ? { viewCount: 'desc' }
                  : { title: 'asc' },
      });
    }

    return NextResponse.json({
      results: [...movies, ...series],
      movies,
      series,
      total: movies.length + series.length,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
