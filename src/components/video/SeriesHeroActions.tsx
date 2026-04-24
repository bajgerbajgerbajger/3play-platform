'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SeriesHeroActionsProps {
  seriesId: string;
  slug: string;
}

export function SeriesHeroActions({ seriesId, slug }: SeriesHeroActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(false);

  const handleToggleWatchlist = async () => {
    const callbackUrl = `/series/${slug}`;
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: seriesId, type: 'series', toggle: true }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setInWatchlist(Boolean(json.inWatchlist));
      toast.success(json.inWatchlist ? 'Přidáno do watchlistu' : 'Odebráno z watchlistu');
    } catch {
      toast.error('Nepodařilo se upravit watchlist');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/series/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Odkaz zkopírován');
    } catch {
      toast.error('Nepodařilo se zkopírovat odkaz');
    }
  };

  return (
    <>
      <Button size="lg" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 gap-2" onClick={handleToggleWatchlist}>
        <Plus className="w-5 h-5" />
        {inWatchlist ? 'V Watchlistu' : 'Add to Watchlist'}
      </Button>

      <Button size="icon" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700" onClick={handleShare}>
        <Share className="w-5 h-5" />
      </Button>
    </>
  );
}
