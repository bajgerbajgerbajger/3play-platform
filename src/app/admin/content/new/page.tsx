'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import axios from 'axios';
import {
    ArrowLeft,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Film,
    HardDrive,
    Image as ImageIcon,
    Settings,
    Sparkles,
    Terminal,
    Tv,
    Upload,
    Wand2,
    Wifi,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Terminal Types ───────────────────────────────────────────────────────────

type LogLevel = 'info' | 'success' | 'error' | 'warning' | 'chunk' | 'system' | 'progress';

interface TerminalLog {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
}

interface UploadStats {
  fileName: string;
  fileSize: number;
  totalChunks: number;
  currentChunk: number;
  bytesUploaded: number;
  speed: number; // MB/s
  eta: number;   // seconds
  phase: 'idle' | 'uploading' | 'assembling' | 'saving' | 'done' | 'error';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

function formatSpeed(mbps: number): string {
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} GB/s`;
  return `${mbps.toFixed(1)} MB/s`;
}

function formatETA(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${s}s`;
}

function nowStr(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function makeBar(pct: number, width = 20): string {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

// ─── Terminal Component ───────────────────────────────────────────────────────

function UploadTerminal({
  logs,
  stats,
  isActive,
}: {
  logs: TerminalLog[];
  stats: UploadStats | null;
  isActive: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!collapsed && bottomRef.current) {
      const container = bottomRef.current.parentElement;
      if (container) {
        // Use scrollTop instead of scrollIntoView to prevent the whole page from jumping
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }
  }, [logs, collapsed]);

  const levelColor: Record<LogLevel, string> = {
    info:     'text-zinc-300',
    success:  'text-emerald-400',
    error:    'text-red-400',
    warning:  'text-yellow-400',
    chunk:    'text-sky-400',
    system:   'text-purple-400',
    progress: 'text-orange-400',
  };

  const levelPrefix: Record<LogLevel, string> = {
    info:     '  ',
    success:  '✓ ',
    error:    '✗ ',
    warning:  '⚠ ',
    chunk:    '↑ ',
    system:   '⚙ ',
    progress: '▸ ',
  };

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current && stats) {
      const pct = (stats.bytesUploaded / stats.fileSize) * 100;
      progressRef.current.style.width = `${pct}%`;
    }
  }, [stats]);

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-zinc-400 text-[11px] tracking-wide">
            upload-process
          </span>
          {isActive && (
            <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Stats bar (only when uploading chunks) */}
      {!collapsed && stats && stats.phase === 'uploading' && stats.totalChunks > 1 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 text-[11px]">
          <span className="flex items-center gap-1.5 text-sky-400">
            <HardDrive className="w-3 h-3" />
            Chunk {stats.currentChunk}/{stats.totalChunks}
          </span>
          <span className="flex items-center gap-1.5 text-orange-400">
            <Wifi className="w-3 h-3" />
            {formatSpeed(stats.speed)}
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <Clock className="w-3 h-3" />
            ETA {formatETA(stats.eta)}
          </span>
          <span className="text-zinc-400">
            {formatBytes(stats.bytesUploaded)} / {formatBytes(stats.fileSize)}
          </span>
          <div className="flex-1 min-w-[120px]">
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                ref={progressRef}
                className="h-full bg-sky-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Log body */}
      {!collapsed && (
        <div className="h-64 overflow-y-auto p-4 space-y-0.5 bg-zinc-950">
          {logs.length === 0 && (
            <span className="text-zinc-600">Waiting for upload to start…</span>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 leading-relaxed">
              <span className="text-zinc-600 shrink-0 select-none">[{log.time}]</span>
              <span className={cn('break-all', levelColor[log.level])}>
                <span className="select-none">{levelPrefix[log.level]}</span>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NewContentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [type, setType] = useState<'movie' | 'series'>('movie');

  // Terminal state
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [uploadStats, setUploadStats] = useState<UploadStats | null>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get('/api/admin/genres');
        setGenres(res.data);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  const videoChunkSize = 25 * 1024 * 1024; // 25 MB

  const posterProgressRef = useRef<HTMLDivElement>(null);
  const backdropProgressRef = useRef<HTMLDivElement>(null);
  const videoProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (posterProgressRef.current && uploadProgress['posterUrl'] !== undefined) {
      posterProgressRef.current.style.width = `${uploadProgress['posterUrl']}%`;
    }
  }, [uploadProgress]);

  useEffect(() => {
    if (backdropProgressRef.current && uploadProgress['backdropUrl'] !== undefined) {
      backdropProgressRef.current.style.width = `${uploadProgress['backdropUrl']}%`;
    }
  }, [uploadProgress]);

  useEffect(() => {
    if (videoProgressRef.current && uploadProgress['videoUrl'] !== undefined) {
      videoProgressRef.current.style.width = `${uploadProgress['videoUrl']}%`;
    }
  }, [uploadProgress]);

  const isUploading = Object.keys(uploadProgress).length > 0;

  // ── Logging helpers ──────────────────────────────────────────────────────

  const addLog = useCallback((level: LogLevel, message: string) => {
    setLogs((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, time: nowStr(), level, message },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setUploadStats(null);
  }, []);

  // ── Form state ───────────────────────────────────────────────────────────

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    releaseYear: new Date().getFullYear().toString(),
    duration: '',
    rating: 'PG-13',
    posterUrl: '',
    backdropUrl: '',
    videoUrl: '',
    isPremium: false,
    isPublished: true,
    startYear: new Date().getFullYear().toString(),
    endYear: '',
    totalSeasons: '1',
    genreIds: [] as string[],
  });

  // ── Upload handler ───────────────────────────────────────────────────────

  const [isGeneratingAI, setIsGeneratingAI] = useState<{
    poster: boolean;
    backdrop: boolean;
  }>({ poster: false, backdrop: false });

  const handleAIGenerate = async (field: 'posterUrl' | 'backdropUrl') => {
    if (!formData.title) {
      toast.error('Please enter a title first');
      return;
    }

    setIsGeneratingAI((prev) => ({ ...prev, [field]: true }));
    setShowTerminal(true);
    addLog('system', `─────────────────────────────────────`);
    addLog('info', `Starting AI generation for ${field.replace('Url', '')}...`);
    addLog('info', `Title: "${formData.title}" | Genre: ${formData.genreIds.join(', ') || 'N/A'}`);

    try {
      const res = await axios.post('/api/admin/generate-wallpaper', {
        title: formData.title,
        genre: formData.genreIds.join(', '),
        type: type,
        videoUrl: formData.videoUrl,
        mode: formData.videoUrl ? 'screenshot' : 'prompt',
      });

      if (res.data.url) {
        setFormData((prev) => ({ ...prev, [field]: res.data.url }));
        addLog('success', `AI image generated successfully!`);
        addLog('success', `Saved to: ${res.data.url}`);
        if (res.data.screenshotUrl) {
          addLog('info', `Reference screenshot extracted: ${res.data.screenshotUrl}`);
        }
        toast.success('AI Image generated successfully!');
      }
    } catch (error: unknown) {
      let msg = 'Generation failed';
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.error || error.message || msg;
      } else if (error instanceof Error) {
        msg = error.message;
      }
      addLog('error', `AI Generation Error: ${msg}`);
      toast.error(`AI Generation failed: ${msg}`);
    } finally {
      setIsGeneratingAI((prev) => ({ ...prev, [field]: false }));
      addLog('system', `─────────────────────────────────────`);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const formatFileNameToTitle = (fileName: string) => {
    const baseName = fileName.split('.').slice(0, -1).join('.');
    return baseName
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldId: 'posterUrl' | 'backdropUrl' | 'videoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Auto-fill title and slug for video files
    if (fieldId === 'videoUrl') {
      const autoTitle = formatFileNameToTitle(file.name);
      setFormData((prev) => ({
        ...prev,
        title: prev.title || autoTitle,
        slug: prev.slug || generateSlug(autoTitle),
      }));
    }

    setShowTerminal(true);
    setUploadProgress((prev) => ({ ...prev, [fieldId]: 1 }));

    const label = fieldId === 'videoUrl' ? 'video' : fieldId.replace('Url', '');

    addLog('system', `─────────────────────────────────────`);
    addLog('info', `Starting ${label} upload: "${file.name}"`);
    addLog('info', `File size: ${formatBytes(file.size)} | Type: ${file.type || 'unknown'}`);

    try {
      if (fieldId === 'videoUrl') {
        // ── Chunked video upload ──────────────────────────────────────────
        const uploadId = crypto.randomUUID();
        const totalChunks = Math.ceil(file.size / videoChunkSize);

        addLog('info', `Chunk size: ${formatBytes(videoChunkSize)} | Total chunks: ${totalChunks}`);
        addLog('system', `Upload ID: ${uploadId}`);
        addLog('system', `─────────────────────────────────────`);

        setUploadStats({
          fileName: file.name,
          fileSize: file.size,
          totalChunks,
          currentChunk: 0,
          bytesUploaded: 0,
          speed: 0,
          eta: 0,
          phase: 'uploading',
        });

        let totalBytesUploaded = 0;
        const speedSamples: number[] = [];

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * videoChunkSize;
          const end = Math.min(start + videoChunkSize, file.size);
          const chunk = file.slice(start, end);
          const chunkSize = end - start;

          const chunkForm = new FormData();
          chunkForm.append('mode', 'chunk');
          chunkForm.append('uploadId', uploadId);
          chunkForm.append('chunkIndex', String(chunkIndex));
          chunkForm.append('totalChunks', String(totalChunks));
          chunkForm.append('fileName', file.name);
          chunkForm.append('chunk', chunk, `${file.name}.part`);

          const barPct = Math.round((chunkIndex / totalChunks) * 100);
          addLog(
            'chunk',
            `[${makeBar(barPct, 16)} ${barPct}%] Chunk ${chunkIndex + 1}/${totalChunks} (${formatBytes(chunkSize)})`
          );

          const chunkStart = Date.now();

          await axios.post('/api/upload', chunkForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 0,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          });

          const elapsedSec = (Date.now() - chunkStart) / 1000;
          const speedMBps = chunkSize / 1024 / 1024 / elapsedSec;
          speedSamples.push(speedMBps);
          if (speedSamples.length > 5) speedSamples.shift();
          const avgSpeed = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;

          totalBytesUploaded += chunkSize;
          const remainingChunks = totalChunks - chunkIndex - 1;
          const etaSec = remainingChunks * (videoChunkSize / 1024 / 1024 / avgSpeed);

          setUploadStats({
            fileName: file.name,
            fileSize: file.size,
            totalChunks,
            currentChunk: chunkIndex + 1,
            bytesUploaded: totalBytesUploaded,
            speed: avgSpeed,
            eta: etaSec,
            phase: 'uploading',
          });

          addLog(
            'success',
            `Chunk ${chunkIndex + 1}/${totalChunks} ✓ — ${formatSpeed(avgSpeed)} | ETA: ${formatETA(etaSec)}`
          );

          const uploadedRatio = (chunkIndex + 1) / totalChunks;
          const progressPct = Math.min(95, Math.round(uploadedRatio * 95));
          setUploadProgress((prev) => ({ ...prev, [fieldId]: progressPct }));
        }

        // ── Assembly phase ──────────────────────────────────────────────
        addLog('system', `─────────────────────────────────────`);
        addLog('system', `All ${totalChunks} chunks uploaded. Starting server-side assembly…`);

        setUploadStats((prev) =>
          prev ? { ...prev, phase: 'assembling', bytesUploaded: file.size } : prev
        );
        setUploadProgress((prev) => ({ ...prev, [fieldId]: 98 }));

        const assemblyStart = Date.now();
        const finalizeRes = await axios.post(
          '/api/upload',
          { uploadId, fileName: file.name, totalChunks },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 0,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );

        const assemblySec = ((Date.now() - assemblyStart) / 1000).toFixed(1);
        addLog('success', `Assembly complete in ${assemblySec}s`);

        if (finalizeRes.data.url) {
          setUploadProgress((prev) => ({ ...prev, [fieldId]: 100 }));
          setFormData((prev) => ({ 
            ...prev, 
            [fieldId]: finalizeRes.data.url,
            // If we got a thumbnail, set it as poster/backdrop if they're empty
            posterUrl: prev.posterUrl || finalizeRes.data.thumbnailUrl || '',
            backdropUrl: prev.backdropUrl || finalizeRes.data.thumbnailUrl || '',
            // Set duration if returned
            duration: prev.duration || finalizeRes.data.duration?.toString() || '',
          }));
          addLog('success', `Saved to: ${finalizeRes.data.url}`);
          if (finalizeRes.data.thumbnailUrl) {
            addLog('success', `Random wallpaper generated: ${finalizeRes.data.thumbnailUrl}`);
          }
          if (finalizeRes.data.duration) {
            const h = Math.floor(finalizeRes.data.duration / 60);
            const m = finalizeRes.data.duration % 60;
            const formatted = h > 0 ? `${h}h ${m}min` : `${m}min`;
            addLog('success', `Video duration detected: ${formatted}`);
          }
          addLog('system', `─────────────────────────────────────`);
          addLog('success', `🎉 Video upload complete! (${formatBytes(file.size)} total)`);

          setUploadStats((prev) => (prev ? { ...prev, phase: 'done' } : prev));
          toast.success('Video uploaded successfully!');
        }
      } else {
        // ── Single-file upload (poster / backdrop) ────────────────────────
        const singleForm = new FormData();
        singleForm.append('file', file);

        const res = await axios.post('/api/upload', singleForm, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 0,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (evt) => {
            const pct = Math.round((evt.loaded * 100) / (evt.total ?? 1));
            setUploadProgress((prev) => ({ ...prev, [fieldId]: pct }));
            addLog('progress', `${label}: [${makeBar(pct, 16)} ${pct}%] ${formatBytes(evt.loaded)} / ${formatBytes(evt.total ?? file.size)}`);
          },
        });

        if (res.data.url) {
          setUploadProgress((prev) => ({ ...prev, [fieldId]: 100 }));
          setFormData((prev) => ({ 
            ...prev, 
            [fieldId]: res.data.url,
            // If we got a thumbnail, set it as poster/backdrop if they're empty
            posterUrl: prev.posterUrl || res.data.thumbnailUrl || '',
            backdropUrl: prev.backdropUrl || res.data.thumbnailUrl || '',
            // Set duration if returned
            duration: prev.duration || res.data.duration?.toString() || '',
          }));
          addLog('success', `Saved to: ${res.data.url}`);
          if (res.data.thumbnailUrl) {
            addLog('success', `Random wallpaper generated: ${res.data.thumbnailUrl}`);
          }
          if (res.data.duration) {
            const h = Math.floor(res.data.duration / 60);
            const m = res.data.duration % 60;
            const formatted = h > 0 ? `${h}h ${m}min` : `${m}min`;
            addLog('success', `Video duration detected: ${formatted}`);
          }
          toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} uploaded successfully!`);
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } }; message?: string })
          ?.response?.data?.error ||
        (err as { message?: string })?.message ||
        'Unknown error';
      addLog('error', `Upload failed: ${msg}`);
      addLog('system', `─────────────────────────────────────`);
      toast.error(`Upload failed: ${msg}`);
      setUploadStats((prev) => (prev ? { ...prev, phase: 'error' } : prev));
    } finally {
      setTimeout(() => {
        setUploadProgress((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }, 1200);
    }
  };

  // ── Form helpers ─────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [id]: value };
      if (id === 'title') {
        next.slug = value
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type }),
      });

      if (res.ok) {
        toast.success(
          `${type === 'movie' ? 'Movie' : 'Series'} added successfully!`
        );
        router.push('/admin/content');
        router.refresh();
      } else {
        const err = await res.text();
        toast.error(err || 'Failed to add content');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20" suppressHydrationWarning>
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/content"
          className="p-2 hover:bg-zinc-900 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Content</h1>
          <p className="text-zinc-400">
            Upload metadata and media files for your library.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Content Type ─────────────────────────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <Label className="text-lg font-bold mb-4 block">Content Type</Label>
          <div className="grid grid-cols-2 gap-4">
            {(['movie', 'series'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all',
                  type === t
                    ? 'border-red-600 bg-red-600/10 text-white'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-700'
                )}
              >
                {t === 'movie' ? (
                  <Film className="w-6 h-6" />
                ) : (
                  <Tv className="w-6 h-6" />
                )}
                <span className="font-bold capitalize">
                  {t === 'movie' ? 'Movie' : 'TV Series'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Basic Information ─────────────────────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <CheckCircle2 className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Inception"
                value={formData.title}
                onChange={handleChange}
                required
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL Path)</Label>
              <Input
                id="slug"
                placeholder="inception"
                value={formData.slug}
                onChange={handleChange}
                required
                className="bg-zinc-950 border-zinc-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A thief who steals corporate secrets through the use of dream-sharing technology…"
              value={formData.description}
              onChange={handleChange}
              required
              className="bg-zinc-950 border-zinc-800 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                placeholder="PG-13"
                value={formData.rating}
                onChange={handleChange}
                className="bg-zinc-950 border-zinc-800"
              />
            </div>

            {type === 'movie' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="releaseYear">Release Year</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    value={formData.releaseYear}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="148"
                    value={formData.duration}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startYear">Start Year</Label>
                  <Input
                    id="startYear"
                    type="number"
                    value={formData.startYear}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalSeasons">Total Seasons</Label>
                  <Input
                    id="totalSeasons"
                    type="number"
                    value={formData.totalSeasons}
                    onChange={handleChange}
                    className="bg-zinc-950 border-zinc-800"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Genres ────────────────────────────────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <Sparkles className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold">Genres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {genres.map((genre) => (
              <div key={genre.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre.id}`}
                  checked={formData.genreIds.includes(genre.id)}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({
                      ...prev,
                      genreIds: checked
                        ? [...prev.genreIds, genre.id]
                        : prev.genreIds.filter((id) => id !== genre.id),
                    }));
                  }}
                />
                <Label
                  htmlFor={`genre-${genre.id}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {genre.name}
                </Label>
              </div>
            ))}
          </div>
          {genres.length === 0 && (
            <p className="text-sm text-zinc-500 italic">No genres found. Please add some to the database.</p>
          )}
        </div>

        {/* ── Media Assets ──────────────────────────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <ImageIcon className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold">Media Assets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Poster */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-400">Poster Image</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAIGenerate('posterUrl')}
                  disabled={isGeneratingAI.poster}
                  className="text-[10px] h-7 bg-red-600/10 text-red-500 hover:bg-red-600/20 gap-1.5 border border-red-600/20"
                >
                  <Wand2 className={cn("w-3 h-3", isGeneratingAI.poster && "animate-pulse")} />
                  {isGeneratingAI.poster ? 'Magic happening…' : 'AI Generate Poster'}
                </Button>
              </div>
              {formData.posterUrl ? (
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
                  <img
                    src={formData.posterUrl}
                    alt="Poster preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, posterUrl: '' }))
                    }
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove poster"
                    aria-label="Remove poster"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-[2/3] rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4 relative">
                  <div className="p-3 bg-zinc-900 rounded-full">
                    <ImageIcon className="w-6 h-6 text-zinc-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload poster</p>
                    <p className="text-xs text-zinc-500">2:3 aspect ratio recommended</p>
                  </div>
                  {uploadProgress['posterUrl'] !== undefined ? (
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-zinc-950/90 backdrop-blur-sm space-y-2">
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          ref={posterProgressRef}
                          className="h-full bg-red-600 transition-all duration-300"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        {uploadProgress['posterUrl'] === 100
                          ? 'Done!'
                          : `${uploadProgress['posterUrl']}%`}
                      </p>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'posterUrl')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Upload poster"
                      title="Upload poster"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Backdrop */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-400">Backdrop Image</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAIGenerate('backdropUrl')}
                  disabled={isGeneratingAI.backdrop}
                  className="text-[10px] h-7 bg-red-600/10 text-red-500 hover:bg-red-600/20 gap-1.5 border border-red-600/20"
                >
                  <Sparkles className={cn("w-3 h-3", isGeneratingAI.backdrop && "animate-pulse")} />
                  {isGeneratingAI.backdrop ? 'Drawing Art…' : 'AI Generate Wallpaper'}
                </Button>
              </div>
              {formData.backdropUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 group">
                  <img
                    src={formData.backdropUrl}
                    alt="Backdrop preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, backdropUrl: '' }))
                    }
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/90 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove backdrop"
                    title="Remove backdrop"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center space-y-4 relative">
                  <div className="p-3 bg-zinc-900 rounded-full">
                    <ImageIcon className="w-6 h-6 text-zinc-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Click to upload backdrop</p>
                    <p className="text-xs text-zinc-500">16:9 aspect ratio recommended</p>
                  </div>
                  {uploadProgress['backdropUrl'] !== undefined ? (
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-zinc-950/90 backdrop-blur-sm space-y-2">
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          ref={backdropProgressRef}
                          className="h-full bg-red-600 transition-all duration-300"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        {uploadProgress['backdropUrl'] === 100
                          ? 'Done!'
                          : `${uploadProgress['backdropUrl']}%`}
                      </p>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'backdropUrl')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      aria-label="Upload backdrop"
                      title="Upload backdrop"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Video Upload (movies only) */}
          {type === 'movie' && (
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <Label className="text-zinc-400">Video Content</Label>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-400 leading-relaxed">
                  <strong>Pro Tip:</strong> For best playback performance, use H.264 (MP4) with &quot;Fast Start&quot; enabled. 
                  Large raw recordings may play choppy in some browsers.
                </p>
              </div>

              {formData.videoUrl ? (
                <div className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                  <div className="p-2 bg-red-600/10 rounded-lg">
                    <Upload className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{formData.videoUrl}</p>
                    <p className="text-xs text-zinc-500">
                      Video stored on server
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, videoUrl: '' }))
                    }
                    className="text-zinc-500 hover:text-white"
                    aria-label="Remove video"
                    title="Remove video"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-zinc-800 bg-zinc-950 rounded-xl p-8 text-center space-y-4">
                  <div className="p-3 bg-zinc-900 rounded-full w-fit mx-auto">
                    <Upload className="w-6 h-6 text-zinc-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Upload Movie File</p>
                    <p className="text-xs text-zinc-500">
                      Supports .mp4, .mkv, .webm — Unlimited file size
                    </p>
                  </div>

                  {uploadProgress['videoUrl'] !== undefined ? (
                    <div className="w-full max-w-md mx-auto space-y-3">
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          ref={videoProgressRef}
                          className="h-full bg-red-600 transition-all duration-300"
                        />
                      </div>
                      <p className="text-sm text-zinc-400 font-medium">
                        {uploadProgress['videoUrl'] >= 98
                          ? '⚙ Assembling chunks on server…'
                          : `${uploadProgress['videoUrl']}% uploaded`}
                      </p>
                      {uploadStats && uploadStats.phase === 'uploading' && (
                        <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Wifi className="w-3 h-3 text-sky-400" />
                            {formatSpeed(uploadStats.speed)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-400" />
                            ETA {formatETA(uploadStats.eta)}
                          </span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-purple-400" />
                            {uploadStats.currentChunk}/{uploadStats.totalChunks} chunks
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() =>
                          document.getElementById('video-input')?.click()
                        }
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Video File
                      </Button>
                      <input
                        id="video-input"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'videoUrl')}
                        className="hidden"
                        aria-label="Upload video file"
                        title="Upload video file"
                      />
                      <p className="text-[10px] text-zinc-600">
                        Chunked upload — no file size limit
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Visibility ────────────────────────────────────────────────── */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
            <Settings className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold">Visibility &amp; Access</h2>
          </div>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, isPublished: !!checked }))
                }
              />
              <Label htmlFor="isPublished">Publish immediately</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) =>
                  setFormData((p) => ({ ...p, isPremium: !!checked }))
                }
              />
              <Label htmlFor="isPremium">Premium Content</Label>
            </div>
          </div>
        </div>

        {/* ── Real-time Terminal Preview ─────────────────────────────────── */}
        {showTerminal && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-semibold text-zinc-300">
                  Upload Terminal
                </span>
                {isUploading && (
                  <span className="text-xs text-emerald-400 font-bold tracking-wider animate-pulse">
                    ● LIVE
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={clearLogs}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Clear
              </button>
            </div>

            <UploadTerminal
              logs={logs}
              stats={uploadStats}
              isActive={isUploading}
            />

            {/* Phase status strip */}
            {uploadStats && (
              <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                {(
                  [
                    ['uploading', 'Uploading'],
                    ['assembling', 'Assembling'],
                    ['saving', 'Saving'],
                    ['done', 'Complete'],
                    ['error', 'Error'],
                  ] as [UploadStats['phase'], string][]
                ).map(([phase, label]) => (
                  <span
                    key={phase}
                    className={cn(
                      'px-2.5 py-1 rounded-full border transition-all',
                      uploadStats.phase === phase
                        ? phase === 'error'
                          ? 'bg-red-600/20 border-red-600/50 text-red-400'
                          : phase === 'done'
                            ? 'bg-emerald-600/20 border-emerald-600/50 text-emerald-400'
                            : 'bg-sky-600/20 border-sky-600/50 text-sky-400'
                        : 'bg-transparent border-zinc-800 text-zinc-600'
                    )}
                  >
                    {uploadStats.phase === phase && phase !== 'error' && phase !== 'done' && (
                      <span className="mr-1 animate-pulse">●</span>
                    )}
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/content">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-12 h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isUploading}
          >
            {isLoading
              ? 'Saving…'
              : isUploading
                ? 'Waiting for upload…'
                : `Add ${type === 'movie' ? 'Movie' : 'Series'}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
