'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useRequireAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
};

export default function NotificationsPage() {
  useRequireAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setItems(res.data.items ?? []);
    } catch {
      toast.error('Nepodařilo se načíst notifikace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string, isRead: boolean) => {
    try {
      await axios.patch('/api/notifications', { id, isRead });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead } : n)));
    } catch {
      toast.error('Nepodařilo se aktualizovat notifikaci');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-6" suppressHydrationWarning>
        <div className="flex items-center justify-between gap-4" suppressHydrationWarning>
          <h1 className="text-3xl font-bold text-white">Notifikace</h1>
          <Button variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700" onClick={load}>
            Obnovit
          </Button>
        </div>

        {loading ? (
          <div className="text-zinc-400">Načítám...</div>
        ) : items.length === 0 ? (
          <div className="text-zinc-400">Žádné notifikace.</div>
        ) : (
          <div className="space-y-3" suppressHydrationWarning>
            {items.map((n) => (
              <div key={n.id} className={`border rounded-xl p-4 ${n.isRead ? 'border-zinc-800 bg-zinc-950/40' : 'border-red-600/40 bg-zinc-950/70'}`} suppressHydrationWarning>
                <div className="flex items-start justify-between gap-4" suppressHydrationWarning>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2" suppressHydrationWarning>
                      <h2 className="text-white font-bold truncate">{n.title}</h2>
                      {!n.isRead && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-black">NEW</span>}
                    </div>
                    <p className="text-zinc-300 mt-1">{n.message}</p>
                    <p className="text-zinc-500 text-xs mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                    {n.link && (
                      <Link href={n.link} className="text-red-400 hover:text-red-300 text-sm font-semibold mt-2 inline-block">
                        Otevřít
                      </Link>
                    )}
                  </div>
                  <Button variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700" onClick={() => markRead(n.id, !n.isRead)}>
                    {n.isRead ? 'Označit jako nepřečtené' : 'Označit jako přečtené'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

