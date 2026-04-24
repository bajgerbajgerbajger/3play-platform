"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

type Genre = { id: string; name: string };

type MovieResponse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  synopsis: string | null;
  releaseYear: number;
  duration: number;
  rating: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  videoUrl: string | null;
  isPremium: boolean;
  isPublished: boolean;
  genres: Genre[];
};

export default function MovieEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movie, setMovie] = useState<MovieResponse | null>(null);
  const [genreIds, setGenreIds] = useState<string[]>([]);

  const form = useMemo(() => {
    if (!movie) return null;
    return {
      title: movie.title ?? '',
      slug: movie.slug ?? '',
      description: movie.description ?? '',
      synopsis: movie.synopsis ?? '',
      releaseYear: String(movie.releaseYear ?? ''),
      duration: String(movie.duration ?? ''),
      rating: movie.rating ?? '',
      posterUrl: movie.posterUrl ?? '',
      backdropUrl: movie.backdropUrl ?? '',
      trailerUrl: movie.trailerUrl ?? '',
      videoUrl: movie.videoUrl ?? '',
      isPremium: !!movie.isPremium,
      isPublished: !!movie.isPublished,
    };
  }, [movie]);

  const [values, setValues] = useState<NonNullable<typeof form> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [movieRes, genresRes] = await Promise.all([
          fetch(`/api/admin/content?id=${params.id}&type=movie`),
          fetch('/api/admin/genres'),
        ]);

        if (!movieRes.ok) throw new Error(await movieRes.text());
        if (!genresRes.ok) throw new Error(await genresRes.text());

        const movieJson = (await movieRes.json()) as MovieResponse;
        const genresJson = (await genresRes.json()) as Genre[];

        if (cancelled) return;
        setMovie(movieJson);
        setGenres(genresJson);
        setGenreIds(movieJson.genres.map((g) => g.id));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load movie';
        toast.error(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (form) setValues(form);
  }, [form]);

  const onChange = (key: keyof NonNullable<typeof form>, value: string | boolean) => {
    setValues((prev) => (prev ? { ...prev, [key]: value as never } : prev));
    if (key === 'title' && typeof value === 'string') {
      setValues((prev) =>
        prev
          ? {
              ...prev,
              title: value,
              slug: value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w-]+/g, ''),
            }
          : prev
      );
    }
  };

  const toggleGenre = (id: string, checked: boolean) => {
    setGenreIds((prev) => (checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id)));
  };

  const onSave = async () => {
    if (!values) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: params.id,
          type: 'movie',
          ...values,
          releaseYear: values.releaseYear ? Number(values.releaseYear) : undefined,
          duration: values.duration ? Number(values.duration) : undefined,
          genreIds,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success('Movie updated');
      router.push('/admin/content');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !values) {
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
          <div className="text-xl font-semibold text-white">Edit Movie</div>
          <div className="text-sm text-zinc-400">{values.title}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={values.title} onChange={(e) => onChange('title', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={values.slug} onChange={(e) => onChange('slug', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => onChange('description', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="synopsis">Synopsis</Label>
            <Textarea
              id="synopsis"
              value={values.synopsis}
              onChange={(e) => onChange('synopsis', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="releaseYear">Release Year</Label>
              <Input
                id="releaseYear"
                value={values.releaseYear}
                onChange={(e) => onChange('releaseYear', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" value={values.duration} onChange={(e) => onChange('duration', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Input id="rating" value={values.rating} onChange={(e) => onChange('rating', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="posterUrl">Poster URL</Label>
            <Input id="posterUrl" value={values.posterUrl} onChange={(e) => onChange('posterUrl', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backdropUrl">Backdrop URL</Label>
            <Input
              id="backdropUrl"
              value={values.backdropUrl}
              onChange={(e) => onChange('backdropUrl', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input id="videoUrl" value={values.videoUrl} onChange={(e) => onChange('videoUrl', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trailerUrl">Trailer URL</Label>
            <Input
              id="trailerUrl"
              value={values.trailerUrl}
              onChange={(e) => onChange('trailerUrl', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 p-3">
            <div className="space-y-1">
              <div className="text-sm text-white">Premium</div>
              <div className="text-xs text-zinc-400">Restrict to premium users</div>
            </div>
            <Switch checked={values.isPremium} onCheckedChange={(v) => onChange('isPremium', v)} />
          </div>

          <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 p-3">
            <div className="space-y-1">
              <div className="text-sm text-white">Published</div>
              <div className="text-xs text-zinc-400">Visible in the app</div>
            </div>
            <Switch checked={values.isPublished} onCheckedChange={(v) => onChange('isPublished', v)} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-white">Genres</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {genres.map((g) => {
            const checked = genreIds.includes(g.id);
            return (
              <label
                key={g.id}
                className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
              >
                <Checkbox checked={checked} onCheckedChange={(v) => toggleGenre(g.id, v === true)} />
                <span>{g.name}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

