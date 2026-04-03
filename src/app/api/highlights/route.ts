import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const highlights = await db.highlight.findMany({
      take: 20,
      orderBy: { score: 'desc' },
      include: {
        movie: {
          select: {
            title: true,
            videoUrl: true,
            backdropUrl: true,
          }
        },
        episode: {
          include: {
            season: {
              include: {
                series: {
                  select: {
                    title: true,
                    backdropUrl: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    // Format for the frontend
    const formatted = highlights.map((h: any) => {
      const title = h.movie?.title || h.episode?.season.series.title || 'Unknown';
      const videoUrl = h.movie?.videoUrl || h.episode?.videoUrl;
      const backdropUrl = h.movie?.backdropUrl || h.episode?.season.series.backdropUrl;

      return {
        id: h.id,
        title,
        description: h.description,
        startTime: h.startTime,
        endTime: h.endTime,
        videoUrl,
        backdropUrl,
      };
    }).filter((h: any) => !!h.videoUrl);

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('[HIGHLIGHTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
