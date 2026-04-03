'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { VideoCard } from '@/components/video/VideoCard';
import { Movie, Series } from '@/types';
import { Loader, Search as SearchIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { VoiceSearch } from '@/components/search/VoiceSearch';

export default function SearchPage() {
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
    <MainLayout>
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
              <Loader className="w-10 h-10 text-red-600 animate-spin" />
              <p className="text-zinc-500 font-medium">Hledám...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {results.map((item) => (
                <VideoCard key={item.id} content={item} />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-24 space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800">
                <SearchIcon className="w-8 h-8 text-zinc-600" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-white">Nebyly nalezeny žádné výsledky</p>
                <p className="text-zinc-400">Zkuste zadat jiný výraz nebo prohlédněte naši nabídku</p>
              </div>
              <Button
                onClick={() => router.push('/browse')}
                variant="secondary"
                size="lg"
                className="rounded-xl px-8"
              >
                Procházet všechen obsah
              </Button>
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="text-zinc-500 text-lg">Zadejte hledaný výraz pro vyhledání filmů a seriálů</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
