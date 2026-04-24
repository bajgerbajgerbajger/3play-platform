import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdmin } from '@/lib/adminAuth';

async function refreshSeriesCounts(seriesId: string) {
  const [totalSeasons, totalEpisodes] = await Promise.all([
    db.season.count({ where: { seriesId } }),
    db.episode.count({ where: { season: { seriesId } } }),
  ]);
  await db.series.update({
    where: { id: seriesId },
    data: { totalSeasons, totalEpisodes },
  });
}

export async function GET(req: NextRequest) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get('seriesId');
    if (!seriesId) return new NextResponse('Missing seriesId', { status: 400 });

    const seasons = await db.season.findMany({
      where: { seriesId },
      orderBy: { seasonNumber: 'asc' },
    });

    return NextResponse.json(seasons);
  } catch (error) {
    console.error('[ADMIN_SEASONS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const body = await req.json();
    const seriesId = typeof body.seriesId === 'string' ? body.seriesId : '';
    const seasonNumber = Number.isFinite(Number(body.seasonNumber)) ? Number(body.seasonNumber) : NaN;

    if (!seriesId || !Number.isInteger(seasonNumber) || seasonNumber <= 0) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const season = await db.season.create({
      data: {
        seriesId,
        seasonNumber,
        title: typeof body.title === 'string' ? body.title : null,
        description: typeof body.description === 'string' ? body.description : null,
        posterUrl: typeof body.posterUrl === 'string' ? body.posterUrl : null,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
      },
    });

    await refreshSeriesCounts(seriesId);
    return NextResponse.json(season);
  } catch (error) {
    console.error('[ADMIN_SEASONS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const body = await req.json();
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id) return new NextResponse('Missing id', { status: 400 });

    const existing = await db.season.findUnique({ where: { id } });
    if (!existing) return new NextResponse('Not Found', { status: 404 });

    const seasonNumber =
      body.seasonNumber !== undefined ? Number(body.seasonNumber) : undefined;

    const season = await db.season.update({
      where: { id },
      data: {
        seasonNumber: Number.isInteger(seasonNumber) && seasonNumber! > 0 ? seasonNumber : undefined,
        title: typeof body.title === 'string' ? body.title : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        posterUrl: typeof body.posterUrl === 'string' ? body.posterUrl : undefined,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
      },
    });

    await refreshSeriesCounts(existing.seriesId);
    return NextResponse.json(season);
  } catch (error) {
    console.error('[ADMIN_SEASONS_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return new NextResponse('Missing id', { status: 400 });

    const existing = await db.season.findUnique({ where: { id } });
    if (!existing) return new NextResponse('Not Found', { status: 404 });

    await db.season.delete({ where: { id } });
    await refreshSeriesCounts(existing.seriesId);

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('[ADMIN_SEASONS_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

