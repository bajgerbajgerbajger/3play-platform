'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Log {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface StatusData {
  status: {
    isUpdating: boolean;
    progress: number;
    estimatedTime: string | null;
    message: string;
    updatedAt: string;
  };
  logs: Log[];
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/system-status');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [data?.logs]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#E50914] animate-spin" />
      </div>
    );
  }

  const { status, logs } = data!;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">STAV SYSTÉMU</h1>
            <p className="text-zinc-400">Aktuální informace o údržbě a synchronizaci</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            {status.isUpdating ? (
              <>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                <span className="font-bold text-yellow-500 uppercase tracking-widest text-sm">Probíhá aktualizace</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-bold text-green-500 uppercase tracking-widest text-sm">Systém je online</span>
              </>
            )}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm font-medium">Průběh</p>
                <p className="text-2xl font-bold">{status.progress}%</p>
              </div>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm font-medium">Odhadovaný čas</p>
                <p className="text-2xl font-bold">{status.estimatedTime || '--:--'}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-500/10 rounded-xl text-zinc-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-500 text-sm font-medium">Poslední aktualizace</p>
                <p className="text-lg font-bold">
                  {new Date(status.updatedAt).toLocaleTimeString('cs-CZ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Status Message */}
        <div className="bg-[#111] border border-white/10 p-8 rounded-2xl">
          <div className="flex items-start gap-4">
            {status.isUpdating ? (
              <AlertCircle className="w-8 h-8 text-yellow-500 shrink-0" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
            )}
            <div>
              <h2 className="text-xl font-bold mb-2">Aktuální stav</h2>
              <p className="text-zinc-400 leading-relaxed text-lg">
                {status.message}
              </p>
            </div>
          </div>
        </div>

        {/* Terminal UI */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Terminal className="w-5 h-5 text-[#E50914]" />
            <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-400">Logy procesu</h3>
          </div>
          <div 
            ref={terminalRef}
            className="bg-black border border-white/10 rounded-2xl p-6 h-80 overflow-y-auto font-mono text-sm space-y-2 custom-scrollbar shadow-2xl"
          >
            {logs.length === 0 && (
              <div className="text-zinc-600 italic">Čekání na data...</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 group">
                <span className="text-zinc-600 shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString('cs-CZ', { hour12: false })}]
                </span>
                <span className={`
                  ${log.type === 'info' ? 'text-blue-400' : ''}
                  ${log.type === 'success' ? 'text-green-400' : ''}
                  ${log.type === 'warning' ? 'text-yellow-400' : ''}
                  ${log.type === 'error' ? 'text-red-400' : ''}
                `}>
                  {log.type === 'error' ? '✖' : log.type === 'success' ? '✔' : '➜'} {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Patience Footer */}
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-zinc-500 italic">
            Děkujeme za vaši trpělivost. Naše servery pracují na plné obrátky, abyste se mohli vrátit ke sledování.
          </p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
