import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id, duration } = await req.json();

    if (!id || !duration) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const movie = await db.movie.update({
      where: { id },
      data: {
        duration: Math.round(duration),
      },
    });

    return NextResponse.json(movie);
  } catch (error) {
    console.error('[MOVIE_DURATION_UPDATE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
