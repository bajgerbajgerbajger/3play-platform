'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    CredentialsSignin: 'Invalid email or password. Please try again.',
    EmailSigninError: 'Unable to sign in with that email.',
    Callback: 'There was an error during authentication.',
    OAuthSignin: 'Error connecting with OAuth provider.',
    OAuthCallback: 'Error in OAuth callback.',
    EmailCreateAccount: 'Could not create user account.',
    SessionCallback: 'Error in session callback.',
    unknown: 'An unknown error occurred. Please try again.',
  };

  const message = error && errorMessages[error] ? errorMessages[error] : errorMessages.unknown;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg border border-red-500/20 p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
          </div>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthErrorContent />
    </Suspense>
  );
}
