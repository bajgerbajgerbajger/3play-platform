'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justifyify-center px-4">
      <div className="text-center">
        <AlertCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />
        <h1 className="text-4xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-gray-400 mb-8 text-lg">An unexpected error occurred. Please try again.</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
