'use client';

import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Suspense, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, Save, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { VideoCard } from '@/components/video/VideoCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Episode, Movie, Series } from '@/types';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
  subscriptions: Array<{
    plan: string;
    currentPeriodEnd: string | null;
  }>;
}

type HistoryEpisode = Episode & {
  season?: {
    series?: Series | null;
  } | null;
};

type HistoryItem = {
  id: string;
  movie?: Movie | null;
  episode?: HistoryEpisode | null;
};

type ContinueWatchingItem = {
  id: string;
  percent: number;
  content: Movie | Series;
  episode?: Episode | null;
};

type FavoriteItem = {
  id: string;
  movie?: Movie | null;
  series?: Series | null;
};

function ProfileContent() {
  useRequireAuth();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'overview';
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAvatar, setDraftAvatar] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [favorites, setFavorites] = useState<Array<Movie | Series>>([]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, isLoading]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/user');
      setUser(response.data);
      setDraftName(response.data?.name ?? '');
      setDraftAvatar(response.data?.avatar ?? '');
    } catch (error) {
      console.error('Failed to fetch user session:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = useCallback(async (activeTab: string) => {
    try {
      if (activeTab === 'history') {
        const res = await axios.get<{ items?: HistoryItem[] }>('/api/history');
        setHistory(res.data.items ?? []);
      }
      if (activeTab === 'continue') {
        const res = await axios.get<{ items?: ContinueWatchingItem[] }>('/api/continue-watching');
        setContinueWatching(res.data.items ?? []);
      }
      if (activeTab === 'favorites') {
        const res = await axios.get<{ items?: FavoriteItem[] }>('/api/favorites');
        const mapped = (res.data.items ?? [])
          .map((x) => x.movie ?? x.series)
          .filter((x): x is Movie | Series => Boolean(x));
        setFavorites(mapped);
      }
    } catch {
      toast.error('Nepodařilo se načíst data profilu');
    }
  }, []);

  useEffect(() => {
    if (tab !== 'overview' && !isLoading && !loading && isAuthenticated) {
      void loadTabData(tab);
    }
  }, [tab, isLoading, loading, isAuthenticated, loadTabData]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please log in</h1>
          <a href="/auth/login" className="text-blue-500 hover:text-blue-400">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put('/api/user', {
        name: draftName,
        avatar: draftAvatar,
      });
      setUser((prev) => (prev ? { ...prev, ...res.data } : prev));
      setIsEditing(false);
      toast.success('Profil uložen');
    } catch {
      toast.error('Nepodařilo se uložit profil');
    }
  };

  const handleCancelEdit = () => {
    setDraftName(user?.name ?? '');
    setDraftAvatar(user?.avatar ?? '');
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6" suppressHydrationWarning>
      <div className="flex items-center justify-between gap-4" suppressHydrationWarning>
        <h1 className="text-3xl font-bold text-white">Profil</h1>
        <div className="flex items-center gap-2" suppressHydrationWarning>
          <Button variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700" onClick={() => router.push('/settings')}>
            Nastavení
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" suppressHydrationWarning>
        <Link href="/profile?tab=overview" className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'overview' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}>
          Přehled
        </Link>
        <Link href="/profile?tab=continue" className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'continue' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}>
          Continue Watching
        </Link>
        <Link href="/profile?tab=history" className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'history' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}>
          Historie
        </Link>
        <Link href="/profile?tab=favorites" className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === 'favorites' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'}`}>
          Favorites
        </Link>
        <Link href="/notifications" className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-900 text-zinc-300 hover:bg-zinc-800">
          Notifikace
        </Link>
      </div>

      {user && tab === 'overview' && (
        <div className="bg-zinc-950/60 rounded-2xl p-6 border border-zinc-800" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row items-start gap-6" suppressHydrationWarning>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name || 'User'} className="w-20 h-20 rounded-xl object-cover border border-zinc-800" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <User className="w-10 h-10 text-zinc-500" />
              </div>
            )}

            <div className="flex-1 w-full" suppressHydrationWarning>
              {!isEditing ? (
                <div className="flex items-start justify-between gap-4" suppressHydrationWarning>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user.name || 'User'}</h2>
                    <p className="text-zinc-400">{user.email}</p>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setIsEditing(true)}>
                    Upravit profil
                  </Button>
                </div>
              ) : (
                <div className="space-y-4" suppressHydrationWarning>
                  <div>
                    <label className="text-sm font-semibold text-zinc-300">Jméno</label>
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="mt-2 w-full h-11 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-zinc-300">Avatar URL</label>
                    <input
                      value={draftAvatar}
                      onChange={(e) => setDraftAvatar(e.target.value)}
                      className="mt-2 w-full h-11 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2" suppressHydrationWarning>
                    <Button className="bg-red-600 hover:bg-red-700 text-white gap-2" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4" /> Uložit
                    </Button>
                    <Button variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 gap-2" onClick={handleCancelEdit}>
                      <X className="w-4 h-4" /> Zrušit
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mt-6 border-t border-zinc-800 pt-6" suppressHydrationWarning>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Email</p>
                    <p className="text-zinc-200 font-semibold">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-xs text-zinc-500">Member Since</p>
                    <p className="text-zinc-200 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3" suppressHydrationWarning>
          {history.length === 0 ? (
            <div className="text-zinc-400">Historie je prázdná.</div>
          ) : (
            history.map((h) => {
              const content = h.movie ?? h.episode?.season?.series;
              if (!content) return null;
              return <VideoCard key={h.id} content={content} variant="compact" />;
            })
          )}
        </div>
      )}

      {tab === 'continue' && (
        <div className="space-y-3" suppressHydrationWarning>
          {continueWatching.length === 0 ? (
            <div className="text-zinc-400">Zatím tu nic není.</div>
          ) : (
            continueWatching.map((cw) => {
              const content = cw.content;
              if (!content) return null;
              const episodeId = cw.episode?.id;
              const playHref = episodeId ? `/watch/${content.slug}/${episodeId}` : `/watch/${content.slug}`;
              return (
                <div key={cw.id} className="flex items-center gap-3 bg-zinc-950/60 border border-zinc-800 rounded-xl p-3" suppressHydrationWarning>
                  <div className="flex-1 min-w-0">
                    <VideoCard content={content} variant="compact" showProgress progress={cw.percent} />
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push(playHref)}>
                    Pokračovat
                  </Button>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" suppressHydrationWarning>
          {favorites.length === 0 ? (
            <div className="text-zinc-400">Žádné favorites.</div>
          ) : (
            favorites.map((item) => <VideoCard key={item.id} content={item} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <MainLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Loading...</div>
        </div>
      }>
        <ProfileContent />
      </Suspense>
    </MainLayout>
  );
}
