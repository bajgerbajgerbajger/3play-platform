import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';
import { assertAdmin } from '@/lib/adminAuth';

function intOrUndefined(value: unknown) {
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: Request) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || (type !== 'movie' && type !== 'series')) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    if (type === 'movie') {
      const movie = await db.movie.findUnique({
        where: { id },
        include: { genres: true },
      });
      if (!movie) return new NextResponse('Not Found', { status: 404 });
      return NextResponse.json(movie);
    }

    const series = await db.series.findUnique({
      where: { id },
      include: { genres: true },
    });
    if (!series) return new NextResponse('Not Found', { status: 404 });
    return NextResponse.json(series);
  } catch (error) {
    console.error('[ADMIN_CONTENT_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const body = await req.json();
    const { 
      type, // 'movie' or 'series'
      title,
      slug,
      description,
      releaseYear,
      duration,
      rating,
      posterUrl,
      backdropUrl,
      videoUrl,
      isPremium,
      isPublished,
      startYear,
      endYear,
      totalSeasons,
      genreIds,
    } = body;

    if (!title || !slug || !description) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    if (type === 'movie') {
      const movie = await db.movie.create({
        data: {
          title,
          slug,
          description,
          releaseYear: parseInt(releaseYear) || new Date().getFullYear(),
          duration: parseInt(duration) || 0,
          rating,
          posterUrl,
          backdropUrl,
          videoUrl,
          isPremium: !!isPremium,
          isPublished: !!isPublished,
          genres: {
            connect: (genreIds || []).map((id: string) => ({ id })),
          },
        },
      });
      return NextResponse.json(movie);
    } else if (type === 'series') {
      const series = await db.series.create({
        data: {
          title,
          slug,
          description,
          startYear: parseInt(startYear) || new Date().getFullYear(),
          endYear: endYear ? parseInt(endYear) : null,
          rating,
          posterUrl,
          backdropUrl,
          isPremium: !!isPremium,
          isPublished: !!isPublished,
          totalSeasons: parseInt(totalSeasons || '0') || 0,
          genres: {
            connect: (genreIds || []).map((id: string) => ({ id })),
          },
        },
      });
      return NextResponse.json(series);
    }

    return new NextResponse('Invalid type', { status: 400 });
  } catch (error) {
    console.error('[ADMIN_CONTENT_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const body = await req.json();
    const type = body?.type;
    const id = body?.id;

    if (!id || (type !== 'movie' && type !== 'series')) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const genreIds = Array.isArray(body.genreIds) ? body.genreIds : undefined;

    if (type === 'movie') {
      const movie = await db.movie.update({
        where: { id },
        data: {
          title: typeof body.title === 'string' ? body.title : undefined,
          slug: typeof body.slug === 'string' ? body.slug : undefined,
          description: typeof body.description === 'string' ? body.description : undefined,
          synopsis: typeof body.synopsis === 'string' ? body.synopsis : undefined,
          releaseYear:
            body.releaseYear !== undefined ? intOrUndefined(body.releaseYear) : undefined,
          duration:
            body.duration !== undefined ? intOrUndefined(body.duration) : undefined,
          rating: typeof body.rating === 'string' ? body.rating : undefined,
          posterUrl: typeof body.posterUrl === 'string' ? body.posterUrl : undefined,
          backdropUrl: typeof body.backdropUrl === 'string' ? body.backdropUrl : undefined,
          trailerUrl: typeof body.trailerUrl === 'string' ? body.trailerUrl : undefined,
          videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl : undefined,
          isPremium: typeof body.isPremium === 'boolean' ? body.isPremium : undefined,
          isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
          genres: genreIds ? { set: genreIds.map((gid: string) => ({ id: gid })) } : undefined,
        },
        include: { genres: true },
      });
      revalidatePath('/admin/content');
      revalidatePath(`/movies/${movie.slug}`);
      revalidatePath('/browse');
      return NextResponse.json(movie);
    }

    const series = await db.series.update({
      where: { id },
      data: {
        title: typeof body.title === 'string' ? body.title : undefined,
        slug: typeof body.slug === 'string' ? body.slug : undefined,
        description: typeof body.description === 'string' ? body.description : undefined,
        synopsis: typeof body.synopsis === 'string' ? body.synopsis : undefined,
        startYear:
          body.startYear !== undefined ? intOrUndefined(body.startYear) : undefined,
        endYear: body.endYear !== undefined && body.endYear !== null ? intOrUndefined(body.endYear) : undefined,
        rating: typeof body.rating === 'string' ? body.rating : undefined,
        posterUrl: typeof body.posterUrl === 'string' ? body.posterUrl : undefined,
        backdropUrl: typeof body.backdropUrl === 'string' ? body.backdropUrl : undefined,
        trailerUrl: typeof body.trailerUrl === 'string' ? body.trailerUrl : undefined,
        isPremium: typeof body.isPremium === 'boolean' ? body.isPremium : undefined,
        isPublished: typeof body.isPublished === 'boolean' ? body.isPublished : undefined,
        totalSeasons:
          body.totalSeasons !== undefined ? intOrUndefined(body.totalSeasons) : undefined,
        genres: genreIds ? { set: genreIds.map((gid: string) => ({ id: gid })) } : undefined,
      },
      include: { genres: true },
    });
    revalidatePath('/admin/content');
    revalidatePath(`/series/${series.slug}`);
    revalidatePath('/browse');
    return NextResponse.json(series);
  } catch (error) {
    console.error('[ADMIN_CONTENT_PATCH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    let content;
    if (type === 'movie') {
      content = await db.movie.delete({
        where: { id },
      });
    } else if (type === 'series') {
      content = await db.series.delete({
        where: { id },
      });
    } else {
      return new NextResponse('Invalid type', { status: 400 });
    }

    // Delete associated media files if they exist
    const filesToDelete = [];
    if (content.posterUrl && content.posterUrl.startsWith('/uploads/')) {
      filesToDelete.push(path.join(process.cwd(), 'public', content.posterUrl));
    }
    if (content.backdropUrl && content.backdropUrl.startsWith('/uploads/')) {
      filesToDelete.push(path.join(process.cwd(), 'public', content.backdropUrl));
    }
    if ('videoUrl' in content && content.videoUrl && content.videoUrl.startsWith('/uploads/')) {
      filesToDelete.push(path.join(process.cwd(), 'public', content.videoUrl));
    }

    for (const filePath of filesToDelete) {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error(`Failed to delete file: ${filePath}`, err);
        }
      }
    }

    revalidatePath('/admin/content');
    revalidatePath('/');
    revalidatePath('/browse');
    
    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    console.error('[ADMIN_CONTENT_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
