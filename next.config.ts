import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: {
    appIsrStatus: false,
  },
  // @ts-expect-error - this is required for cross-device development in some next versions
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    'localhost:3000',
    '192.168.1.211',
    'localhost:3001',
    'run-agent-69eb2aa3bc8cc5f30d64e61b-mocnk9jn.remote-agent.svc.cluster.local',
    'run-agent-69eb2aa3bc8cc5f30d64e61b-mocnk9jn-preview.agent-sandbox-my-c1-gw.trae.ai',
  ],
  serverExternalPackages: ['better-sqlite3', 'fluent-ffmpeg', 'sharp'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    proxyClientMaxBodySize: '500mb',
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
