import { db } from '@/lib/db';
import { Film, Tv, Users, PlayCircle } from 'lucide-react';

export default async function AdminPage() {
  const [movieCount, seriesCount, userCount] = await Promise.all([
    db.movie.count(),
    db.series.count(),
    db.user.count(),
  ]);

  const stats = [
    { label: 'Total Movies', value: movieCount, icon: Film, color: 'text-blue-500' },
    { label: 'Total Series', value: seriesCount, icon: Tv, color: 'text-purple-500' },
    { label: 'Total Users', value: userCount, icon: Users, color: 'text-green-500' },
    { label: 'Active Streams', value: '1.2k', icon: PlayCircle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Overview</h1>
        <p className="text-zinc-400">Welcome back to your dashboard. Here is what is happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Today</span>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-zinc-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold mb-4 text-zinc-300">Quick Actions</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/admin/content/new" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">
            Add New Content
          </a>
          <a href="/admin/content" className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold transition-colors border border-zinc-700">
            Manage Library
          </a>
        </div>
      </div>
    </div>
  );
}
