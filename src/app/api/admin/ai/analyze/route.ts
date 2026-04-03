import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeContentForHighlights } from '@/lib/aiEngine';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { contentId, type } = await req.json();

    if (!contentId || !type) {
      return new NextResponse('Missing contentId or type', { status: 400 });
    }

    const highlights = await analyzeContentForHighlights(contentId, type);

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('[AI_ANALYZE_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
