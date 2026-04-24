import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdmin } from '@/lib/adminAuth';

async function refreshCountsFromSeason(seasonId: string) {
  const season = await db.season.findUnique({ where: { id: seasonId } });
  if (!season) return;

  const [episodeCount, totalSeasons, totalEpisodes] = await Promise.all([
    db.episode.count({ where: { seasonId } }),
    db.season.count({ where: { seriesId: season.seriesId } }),
    db.episode.count({ where: { season: { seriesId: season.seriesId } } }),
  ]);

  await Promise.all([
    db.season.update({ where: { id: seasonId }, data: { episodeCount } }),
    db.series.update({
      where: { id: season.seriesId },
      data: { totalSeasons, totalEpisodes },
    }),
  ]);
}

export async function GET(req: NextRequest) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get('seasonId');
    if (!seasonId) return new NextResponse('Missing seasonId', { status: 400 });

    const episodes = await db.episode.findMany({
      where: { seasonId },
      orderBy: { episodeNumber: 'asc' },
    });

    return NextResponse.json(episodes);
  } catch (error) {
    console.error('[ADMIN_EPISODES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const body = await req.json();
    const seasonId = typeof body.seasonId === 'string' ? body.seasonId : '';
    const episodeNumber = Number.isFinite(Number(body.episodeNumber)) ? Number(body.episodeNumber) : NaN;
    const title = typeof body.title === 'string' ? body.title : '';
    const description = typeof body.description === 'string' ? body.description : '';
    const duration = Number.isFinite(Number(body.duration)) ? Number(body.duration) : NaN;

    if (!seasonId || !Number.isInteger(episodeNumber) || episodeNumber <= 0 || !title || !description || !Number.isInteger(duration) || duration < 0) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const episode = await db.episode.create({
      data: {
        seasonId,
        episodeNumber,
        title,
        description,
        duration,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
        thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : null,
        videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl : null,
        isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : false,
      },
    });

    await refreshCountsFromSeason(seasonId);
    return NextResponse.json(episode);
  } catch (error) {
    console.error('[ADMIN_EPISODES_POST]', error);
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

    const existing = await db.episode.findUnique({ where: { id } });
    if (!existing) return new NextResponse('Not Found', { status: 404 });

    const episodeNumber = body.episodeNumber !== undefined ? Number(body.episodeNumber) : undefined;
    const duration = body.duration !== undefined ? Number(body.duration) : undefined;

    const episode = await db.episode.update({
      where: { id },
      data: {
        episodeNumber: Number.isInteger(episodeNumber) && episodeNumber! > 0 ? episodeNumber : undefined,
        title: typeof body.title === 'string' ? body.title : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        duration: Number.isInteger(duration) && duration! >= 0 ? duration : undefined,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
        thumbnailUrl: typeof body.thumbnailUrl === 'string' ? body.thumbnailUrl : undefined,
        videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl : undefined,
        isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
      },
    });

    await refreshCountsFromSeason(existing.seasonId);
    return NextResponse.json(episode);
  } catch (error) {
    console.error('[ADMIN_EPISODES_PUT]', error);
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

    const existing = await db.episode.findUnique({ where: { id } });
    if (!existing) return new NextResponse('Not Found', { status: 404 });

    await db.episode.delete({ where: { id } });
    await refreshCountsFromSeason(existing.seasonId);

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('[ADMIN_EPISODES_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

