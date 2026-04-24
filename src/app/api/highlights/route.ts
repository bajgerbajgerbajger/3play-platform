import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type HighlightResult = Awaited<ReturnType<typeof db.highlight.findMany>>[number];

type FormattedHighlight = {
  id: string;
  title: string;
  description: string | null;
  startTime: number;
  endTime: number;
  videoUrl: string;
  backdropUrl: string | null;
};

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
    const formatted = (highlights as HighlightResult[])
      .map((h): FormattedHighlight | null => {
        const title = h.movie?.title ?? h.episode?.season.series.title ?? 'Unknown';
        const videoUrl = h.movie?.videoUrl ?? h.episode?.videoUrl ?? null;
        if (!videoUrl) return null;

        const backdropUrl = h.movie?.backdropUrl ?? h.episode?.season.series.backdropUrl ?? null;

        return {
          id: h.id,
          title,
          description: h.description,
          startTime: h.startTime,
          endTime: h.endTime,
          videoUrl,
          backdropUrl,
        };
      })
      .filter((h): h is FormattedHighlight => h !== null);

    return NextResponse.json(formatted satisfies FormattedHighlight[]);
  } catch (error) {
    console.error('[HIGHLIGHTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
