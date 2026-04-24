import { NextRequest, NextResponse } from 'next/server';
import { webdavGet } from '@/lib/webdav';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  const segments = Array.isArray(ctx.params.path) ? ctx.params.path : [];
  if (segments.length === 0) return new NextResponse('Not Found', { status: 404 });
  if (segments.some((s) => s === '..' || s.includes('..'))) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  const remotePath = segments.map(decodeURIComponent).join('/');
  const range = req.headers.get('range') ?? undefined;

  const upstream = await webdavGet(remotePath, range);

  const headers = new Headers();
  for (const key of [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'etag',
    'last-modified',
    'cache-control',
  ]) {
    const v = upstream.headers.get(key);
    if (v) headers.set(key, v);
  }

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}

