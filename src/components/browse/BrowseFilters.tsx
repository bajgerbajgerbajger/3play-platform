'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, SortAsc } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BrowseFiltersProps {
  genres: { id: string; name: string; slug: string }[];
}

export function BrowseFilters({ genres }: BrowseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentGenre = (searchParams.get('genre') || 'all') as string;
  const currentType = (searchParams.get('type') || 'all') as string;
  const currentSort = (searchParams.get('sort') || 'popularity') as string;
  const currentYear = (searchParams.get('year') || 'all') as string;

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/browse?${params.toString()}`);
  };

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="px-4 sm:px-6 lg:px-8 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
          <Select value={currentType} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger className="w-[110px] sm:w-32 bg-zinc-900 border-zinc-800 text-white h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="movie">Movies</SelectItem>
              <SelectItem value="series">Series</SelectItem>
            </SelectContent>
          </Select>

          <Select value={currentGenre} onValueChange={(value) => updateFilter('genre', value)}>
            <SelectTrigger className="w-[130px] sm:w-40 bg-zinc-900 border-zinc-800 text-white h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre.id} value={genre.slug}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currentYear} onValueChange={(value) => updateFilter('year', value)}>
            <SelectTrigger className="w-[100px] sm:w-32 bg-zinc-900 border-zinc-800 text-white h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 max-h-48">
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800 w-full sm:w-auto">
          <SortAsc className="w-4 h-4 text-zinc-400" />
          <span className="text-xs sm:text-sm text-zinc-400">Sort:</span>
          <Select value={currentSort} onValueChange={(value) => updateFilter('sort', value)}>
            <SelectTrigger className="flex-1 sm:w-40 bg-zinc-900 border-zinc-800 text-white h-9 text-xs sm:text-sm">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
