import Link from 'next/link';
import Image from 'next/image';
import { Play, Plus, Share, Star } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContentRow } from '@/components/video/ContentRow';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';

async function getSeries(slug: string) {
  const series = await db.series.findUnique({
    where: { slug },
    include: {
      genres: true,
      cast: { orderBy: { order: 'asc' } },
      crew: true,
      seasons: {
        orderBy: { seasonNumber: 'asc' },
        include: {
          episodes: {
            orderBy: { episodeNumber: 'asc' },
          },
        },
      },
    },
  });

  if (!series) return null;

  return series;
}

async function getRelatedSeries(seriesId: string, genreIds: string[]) {
  return db.series.findMany({
    where: {
      id: { not: seriesId },
      isPublished: true,
      genres: { some: { id: { in: genreIds } } },
    },
    include: { genres: true, cast: true, crew: true, seasons: { include: { episodes: true } } },
    take: 10,
  });
}

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const series = await getSeries(slug);

  if (!series) {
    notFound();
  }

  const relatedSeries = await getRelatedSeries(
    series.id,
    series.genres.map((g) => g.id)
  );

  const firstEpisode = series.seasons[0]?.episodes[0];

  return (
    <MainLayout>
      <div className="pb-8">
        {/* Hero Section */}
        <div className="relative h-[60vh] min-h-[400px]">
          <div className="absolute inset-0">
            {series.backdropUrl ? (
              <Image
                src={series.backdropUrl}
                alt={series.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            ) : (
              <div className="w-full h-full bg-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent" />
          </div>

          <div className="relative h-full flex items-end">
            <div className="w-full px-4 sm:px-6 lg:px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="hidden md:block shrink-0">
                  <div className="relative w-48 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                    {series.posterUrl ? (
                      <Image
                        src={series.posterUrl}
                        alt={series.title}
                        fill
                        className="object-cover"
                        sizes="192px"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    {series.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-zinc-300">{series.startYear}-{series.endYear || 'Present'}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300">{series.totalSeasons} Seasons</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-300">{series.totalEpisodes} Episodes</span>
                    {series.rating && (
                      <>
                        <span className="text-zinc-500">•</span>
                        <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                          {series.rating}
                        </Badge>
                      </>
                    )}
                    {series.averageRating > 0 && (
                      <>
                        <span className="text-zinc-500">•</span>
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          {series.averageRating.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {series.genres.map((genre) => (
                      <Link key={genre.id} href={`/browse?genre=${genre.slug}`}>
                        <Badge className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                          {genre.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {firstEpisode && (
                      <Link href={`/watch/${series.slug}/${firstEpisode.id}`}>
                        <Button size="lg" className="bg-white text-black hover:bg-white/90 gap-2">
                          <Play className="w-5 h-5" fill="black" />
                          Watch S1 E1
                        </Button>
                      </Link>
                    )}

                    <Button size="lg" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 gap-2">
                      <Plus className="w-5 h-5" />
                      Add to Watchlist
                    </Button>

                    <Button size="icon" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700">
                      <Share className="w-5 h-5" />
                    </Button>
                  </div>

                  <p className="text-zinc-300 max-w-3xl">{series.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes & Seasons */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-semibold text-white mb-6">Episodes</h2>

            <Accordion>
              {series.seasons.map((season) => (
                <AccordionItem key={season.id} className="border-zinc-800">
                  <AccordionTrigger className="text-white hover:no-underline py-4">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">Season {season.seasonNumber}</span>
                      {season.title && <span className="text-zinc-500 font-normal">{season.title}</span>}
                      <span className="text-zinc-500 text-sm">{season.episodeCount} Episodes</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {season.episodes.map((episode) => (
                        <Link
                          key={episode.id}
                          href={`/watch/${series.slug}/${episode.id}`}
                          className="flex gap-4 p-4 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors group"
                        >
                          <div className="relative shrink-0 w-32 aspect-video rounded overflow-hidden">
                            {episode.thumbnailUrl ? (
                              <Image
                                src={episode.thumbnailUrl}
                                alt={episode.title}
                                fill
                                className="object-cover"
                                sizes="128px"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <Play className="w-8 h-8 text-zinc-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-10 h-10 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-white font-medium">
                                {episode.episodeNumber}. {episode.title}
                              </h3>
                              <span className="text-zinc-500 text-sm shrink-0">{episode.duration} min</span>
                            </div>
                            <p className="text-zinc-400 text-sm line-clamp-2 mt-1">
                              {episode.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Cast */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-t border-zinc-800">
          <h2 className="text-xl font-semibold text-white mb-4">Cast</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {series.cast.slice(0, 8).map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-zinc-400">{member.name[0]}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{member.name}</p>
                    {member.role && (
                      <p className="text-zinc-500 text-xs">{member.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Related Content */}
        {relatedSeries.length > 0 && (
          <ContentRow
            title="More Like This"
            items={relatedSeries}
          />
        )}
      </div>
    </MainLayout>
  );
}
