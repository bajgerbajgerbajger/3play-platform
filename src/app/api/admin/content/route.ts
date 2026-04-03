import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

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

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

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
