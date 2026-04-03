'use client';

import { useAuth } from '@/hooks/useAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Calendar } from 'lucide-react';

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

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, isLoading]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/session');
      if (response.data?.user) {
        // Adapt session user to UserProfile format
        const sessionUser = response.data.user;
        setUser({
          id: sessionUser.id || '',
          email: sessionUser.email || '',
          name: sessionUser.name || null,
          avatar: sessionUser.avatar || sessionUser.image || null,
          createdAt: new Date().toISOString(), // Fallback if not in session
          subscriptions: [] // Not available in session by default
        });
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Please log in</h1>
            <a href="/auth/login" className="text-blue-500 hover:text-blue-400">
              Go to login
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-white mb-8">My Profile</h1>

        {user && (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="flex items-start gap-6 mb-8">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{user.name || 'User'}</h2>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user.subscriptions.length > 0 && (
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Subscription</p>
                    <p className="text-white font-semibold">{user.subscriptions[0].plan}</p>
                  </div>
                </div>
              )}
            </div>

            <button className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
