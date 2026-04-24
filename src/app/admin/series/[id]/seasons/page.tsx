"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Season = {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string | null;
  episodeCount: number;
};

type SeriesLite = { id: string; title: string };

export default function SeasonsAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [series, setSeries] = useState<SeriesLite | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newSeasonNumber, setNewSeasonNumber] = useState('');
  const [newSeasonTitle, setNewSeasonTitle] = useState('');

  const sorted = useMemo(
    () => [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber),
    [seasons]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [seriesRes, seasonsRes] = await Promise.all([
        fetch(`/api/admin/content?id=${params.id}&type=series`),
        fetch(`/api/admin/seasons?seriesId=${params.id}`),
      ]);

      if (!seriesRes.ok) throw new Error(await seriesRes.text());
      if (!seasonsRes.ok) throw new Error(await seasonsRes.text());

      const s = await seriesRes.json();
      const seasonList = (await seasonsRes.json()) as Season[];

      setSeries({ id: s.id, title: s.title });
      setSeasons(seasonList);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load seasons';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const createSeason = async () => {
    const n = Number(newSeasonNumber);
    if (!Number.isInteger(n) || n <= 0) {
      toast.error('Season number must be a positive integer');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId: params.id,
          seasonNumber: n,
          title: newSeasonTitle || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Season created');
      setNewSeasonNumber('');
      setNewSeasonTitle('');
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Create failed';
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteSeason = async (seasonId: string) => {
    const ok = window.confirm('Delete this season? Episodes will also be deleted.');
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/seasons?id=${seasonId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Season deleted');
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-zinc-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xl font-semibold text-white">Seasons</div>
          <div className="text-sm text-zinc-400">{series?.title}</div>
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-4">
        <div className="text-sm font-medium text-white">Add Season</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seasonNumber">Season Number</Label>
            <Input id="seasonNumber" value={newSeasonNumber} onChange={(e) => setNewSeasonNumber(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seasonTitle">Title (optional)</Label>
            <Input id="seasonTitle" value={newSeasonTitle} onChange={(e) => setNewSeasonTitle(e.target.value)} />
          </div>
        </div>
        <Button onClick={createSeason} disabled={isCreating}>
          {isCreating ? 'Creating…' : 'Create Season'}
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-zinc-400">No seasons yet.</div>
        ) : (
          sorted.map((season) => (
            <div
              key={season.id}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="space-y-1">
                <div className="text-white font-medium">
                  Season {season.seasonNumber} {season.title ? `— ${season.title}` : ''}
                </div>
                <div className="text-sm text-zinc-400">{season.episodeCount} episodes</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push(`/admin/series/${params.id}/seasons/${season.id}/episodes`)}>
                  Episodes
                </Button>
                <Button variant="destructive" onClick={() => deleteSeason(season.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
