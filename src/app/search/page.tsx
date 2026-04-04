'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/video/VideoCard';
import { Movie, Series } from '@/types';
import { Loader, Search as SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { VoiceSearch } from '@/components/search/VoiceSearch';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<(Movie | Series)[]>([]);
  const [isLoading, setIsLoading] = useState(!!query);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('q', query);

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to search');
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="pb-8">
      {/* Search Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-zinc-800 bg-zinc-950/50">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-4xl font-black text-white tracking-tight">Vyhledávání</h1>
          
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <Input
                type="search"
                placeholder="Filmy, seriály, herci..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pl-12 h-14 bg-zinc-900/80 border-zinc-800 focus:border-red-600 focus:ring-red-600 transition-all rounded-2xl text-lg shadow-xl"
              />
            </div>
            <VoiceSearch 
              className="h-14 w-14 rounded-2xl bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800"
              onResult={(text) => {
                setInputValue(text);
                router.push(`/search?q=${encodeURIComponent(text)}`);
              }} 
            />
          </form>

          <p className="text-zinc-400 text-sm">
            {query
              ? <>Výsledky pro &ldquo;<span className="text-white font-medium">{query}</span>&rdquo;</>
              : 'Zadejte hledaný výraz pro vyhledání filmů a seriálů'}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader className="h-10 w-10 text-red-600 animate-spin" />
            <p className="text-zinc-400 animate-pulse">Vyhledávám nejlepší obsah...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {results.map((item) => (
              <VideoCard key={`${item.id}-${'title' in item ? 'movie' : 'series'}`} item={item} />
            ))}
          </div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
            <div className="h-24 w-24 rounded-full bg-zinc-900 flex items-center justify-center">
              <SearchIcon className="h-10 w-10 text-zinc-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Nenalezli jsme žádné výsledky</h3>
              <p className="text-zinc-500 max-w-md">
                Zkuste jiné klíčové slovo nebo zkontrolujte překlepy.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
            <div className="h-24 w-24 rounded-full bg-zinc-900 flex items-center justify-center">
              <SearchIcon className="h-10 w-10 text-zinc-700" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Zadejte hledaný výraz</h3>
              <p className="text-zinc-500 max-w-md">
                Hledejte své oblíbené filmy a seriály v naší rozsáhlé knihovně.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader className="h-8 w-8 text-red-600 animate-spin" />
        </div>
      }>
        <SearchContent />
      </Suspense>
    </MainLayout>
  );
}
