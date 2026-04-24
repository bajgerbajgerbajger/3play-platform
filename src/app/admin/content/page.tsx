import { db } from '@/lib/db';
import { 
  Plus, 
  Search, 
  Film, 
  Tv, 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ContentActions } from './ContentActions';

export const dynamic = 'force-dynamic';

export default async function ContentManagerPage() {
  const [movies, series] = await Promise.all([
    db.movie.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    db.series.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);

  return (
    <div className="space-y-8" suppressHydrationWarning>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Manager</h1>
          <p className="text-zinc-400">Manage your movies, series, and categories.</p>
        </div>
        <Link 
          href="/admin/content/new" 
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Content
        </Link>
      </div>

      {/* Movies Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold">Recent Movies</h2>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search movies..." 
              className="bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-red-600 w-full"
            />
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="block lg:hidden divide-y divide-zinc-800">
          {movies.map((movie) => (
            <div key={movie.id} className="p-4 flex items-center gap-4">
              <div className="w-16 h-24 relative rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-800">
                {movie.posterUrl && (
                  <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{movie.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-zinc-500">{movie.releaseYear}</span>
                  <span className="text-[10px] text-zinc-600">•</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    movie.isPublished ? "text-green-500" : "text-yellow-500"
                  )}>
                    {movie.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">{movie.viewCount.toLocaleString()} views</p>
              </div>
              <ContentActions id={movie.id} type="movie" title={movie.title} slug={movie.slug} />
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900/80 text-zinc-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Content</th>
                <th className="px-6 py-4 text-left font-semibold">Year</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Views</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 relative rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-zinc-800">
                        {movie.posterUrl && (
                          <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{movie.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1 max-w-[200px]">{movie.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{movie.releaseYear}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                      movie.isPublished ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {movie.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{movie.viewCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <ContentActions id={movie.id} type="movie" title={movie.title} slug={movie.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Series Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold">Recent Series</h2>
          </div>
        </div>

        {/* Mobile View (Cards) */}
        <div className="block lg:hidden divide-y divide-zinc-800">
          {series.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4">
              <div className="w-16 h-24 relative rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-zinc-800">
                {item.posterUrl && (
                  <Image src={item.posterUrl} alt={item.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white truncate">{item.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-zinc-500">{item.totalSeasons} Seasons</span>
                  <span className="text-[10px] text-zinc-600">•</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    item.isPublished ? "text-green-500" : "text-yellow-500"
                  )}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <ContentActions id={item.id} type="series" title={item.title} slug={item.slug} />
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900/80 text-zinc-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Content</th>
                <th className="px-6 py-4 text-left font-semibold">Seasons</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {series.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 relative rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-zinc-800">
                        {item.posterUrl && (
                          <Image src={item.posterUrl} alt={item.title} fill className="object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.title}</p>
                        <p className="text-xs text-zinc-500 line-clamp-1 max-w-[200px]">{item.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.totalSeasons} Seasons</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                      item.isPublished ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ContentActions id={item.id} type="series" title={item.title} slug={item.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
