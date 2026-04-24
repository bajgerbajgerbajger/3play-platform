import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { assertAdmin } from '@/lib/adminAuth';

export async function GET() {
  try {
    const authError = await assertAdmin();
    if (authError) return authError;

    const genres = await db.genre.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(genres);
  } catch (error) {
    console.error('[GENRES_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
