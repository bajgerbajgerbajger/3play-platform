'use client';

import { useAuth, useRequireAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { useState } from 'react';
import { Bell, Lock, Moon, Volume2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: true,
    volume: 80,
  });

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4" suppressHydrationWarning>
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6" suppressHydrationWarning>
          {/* Notifications */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotifications: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-300">Email Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, pushNotifications: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-300">Push Notifications</span>
              </label>
            </div>
          </div>

          {/* Playback */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">Playback</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Volume Level</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.volume}
                  onChange={(e) => setSettings({ ...settings, volume: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-gray-400 text-sm mt-2">{settings.volume}%</p>
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">Display</h2>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-gray-300">Dark Mode</span>
            </label>
          </div>

          {/* Security */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-white">Security</h2>
            </div>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
              Change Password
            </button>
          </div>

          {/* Logout */}
          <div className="bg-slate-800 rounded-lg p-6 border border-red-500/20">
            <div className="flex items-center gap-3 mb-4">
              <LogOut className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-white">Session</h2>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
              Save Changes
            </button>
            <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
