"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Season = {
  id: string;
  seasonNumber: number;
  title: string | null;
};

type Episode = {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  isPublished: boolean;
};

export default function EpisodesAdminPage({ params }: { params: { id: string; seasonId: string } }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [season, setSeason] = useState<Season | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  const [episodeNumber, setEpisodeNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const sorted = useMemo(
    () => [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber),
    [episodes]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [seasonsRes, episodesRes] = await Promise.all([
        fetch(`/api/admin/seasons?seriesId=${params.id}`),
        fetch(`/api/admin/episodes?seasonId=${params.seasonId}`),
      ]);

      if (!seasonsRes.ok) throw new Error(await seasonsRes.text());
      if (!episodesRes.ok) throw new Error(await episodesRes.text());

      const seasons = (await seasonsRes.json()) as Season[];
      const eps = (await episodesRes.json()) as Episode[];
      const current = seasons.find((s) => s.id === params.seasonId) ?? null;

      setSeason(current);
      setEpisodes(eps);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load episodes';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, params.seasonId]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadVideo = async (file: File) => {
    setUploadPct(0);
    const chunkSize = 25 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = `ep-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const form = new FormData();
        form.append('mode', 'chunk');
        form.append('uploadId', uploadId);
        form.append('chunkIndex', String(chunkIndex));
        form.append('totalChunks', String(totalChunks));
        form.append('fileName', file.name);
        form.append('chunk', chunk, `${file.name}.part`);

        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (!res.ok) throw new Error(await res.text());
        const pct = Math.round(((chunkIndex + 1) / totalChunks) * 95);
        setUploadPct(pct);
      }

      const finalizeRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId, fileName: file.name, totalChunks }),
      });
      if (!finalizeRes.ok) throw new Error(await finalizeRes.text());
      const json = (await finalizeRes.json()) as { url?: string; thumbnailUrl?: string; duration?: number };

      if (json.url) setVideoUrl(json.url);
      if (json.thumbnailUrl) setThumbnailUrl(json.thumbnailUrl);
      if (json.duration !== undefined) setDuration(String(json.duration));
      setUploadPct(100);
      toast.success('Video uploaded');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      toast.error(msg);
      setUploadPct(null);
    }
  };

  const createEpisode = async () => {
    const n = Number(episodeNumber);
    const d = Number(duration);
    if (!Number.isInteger(n) || n <= 0) {
      toast.error('Episode number must be a positive integer');
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    if (!Number.isInteger(d) || d < 0) {
      toast.error('Duration must be an integer (minutes)');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonId: params.seasonId,
          episodeNumber: n,
          title: title.trim(),
          description: description.trim(),
          duration: d,
          thumbnailUrl: thumbnailUrl || null,
          videoUrl: videoUrl || null,
          isPublished,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Episode created');
      setEpisodeNumber('');
      setTitle('');
      setDescription('');
      setDuration('');
      setThumbnailUrl('');
      setVideoUrl('');
      setIsPublished(false);
      setUploadPct(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Create failed';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (ep: Episode, next: boolean) => {
    try {
      const res = await fetch('/api/admin/episodes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ep.id, isPublished: next }),
      });
      if (!res.ok) throw new Error(await res.text());
      setEpisodes((prev) => prev.map((x) => (x.id === ep.id ? { ...x, isPublished: next } : x)));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      toast.error(msg);
    }
  };

  const deleteEpisode = async (episodeId: string) => {
    const ok = window.confirm('Delete this episode?');
    if (!ok) return;

    try {
      const res = await fetch(`/api/admin/episodes?id=${episodeId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      toast.success('Episode deleted');
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
          <div className="text-xl font-semibold text-white">Episodes</div>
          <div className="text-sm text-zinc-400">
            Season {season?.seasonNumber ?? '—'} {season?.title ? `— ${season.title}` : ''}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/series/${params.id}/seasons`)}>
            Seasons
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-4">
        <div className="text-sm font-medium text-white">Add Episode</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="episodeNumber">Episode Number</Label>
            <Input id="episodeNumber" value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (min)</Label>
            <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input id="thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 p-3">
          <div className="space-y-1">
            <div className="text-sm text-white">Published</div>
            <div className="text-xs text-zinc-400">Visible in the app</div>
          </div>
          <Switch checked={isPublished} onCheckedChange={setIsPublished} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadVideo(f);
              if (fileRef.current) fileRef.current.value = '';
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Upload Video
          </Button>
          {uploadPct !== null && <div className="text-sm text-zinc-400">Upload: {uploadPct}%</div>}
        </div>

        <Button onClick={createEpisode} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Create Episode'}
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-zinc-400">No episodes yet.</div>
        ) : (
          sorted.map((ep) => (
            <div
              key={ep.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="space-y-1">
                <div className="text-white font-medium">
                  E{ep.episodeNumber}. {ep.title}
                </div>
                <div className="text-sm text-zinc-400">
                  {ep.duration} min {ep.videoUrl ? '• video set' : '• no video'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-zinc-400">Published</div>
                  <Switch checked={ep.isPublished} onCheckedChange={(v) => togglePublish(ep, v)} />
                </div>
                <Button variant="destructive" onClick={() => deleteEpisode(ep.id)}>
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
