import assert from 'node:assert/strict';
import type { NextRequest } from 'next/server';

async function main() {
  delete process.env.NEXTAUTH_SECRET;
  const { middleware } = await import('../../middleware');

  {
    const res = await middleware({
      nextUrl: { pathname: '/auth/error' },
      url: 'http://localhost:3000/auth/error',
    } as unknown as NextRequest);
    assert.equal(res.headers.get('x-middleware-next'), '1');
  }

  {
    process.env.NEXTAUTH_SECRET = 'x';
    const res = await middleware({
      nextUrl: { pathname: '/auth/error' },
      url: 'http://localhost:3000/auth/error',
    } as unknown as NextRequest);
    assert.equal(res.headers.get('x-middleware-next'), '1');
  }

  {
    process.env.NEXTAUTH_SECRET = 'x';
    const res = await middleware({
      nextUrl: { pathname: '/admin' },
      url: 'http://localhost:3000/admin',
      headers: {
        get: (name: string) => (name.toLowerCase() === 'cookie' ? 'next-auth.session-token=invalid' : null),
      },
      cookies: {
        get: () => ({ value: 'invalid' }),
      },
    } as unknown as NextRequest);
    assert.equal(res.status, 307);
    assert.equal(res.headers.get('location'), 'http://localhost:3000/');
  }

  {
    const res = await middleware({
      nextUrl: { pathname: '/admin' },
      url: 'http://localhost:3000/admin',
    } as unknown as NextRequest);
    assert.equal(res.status, 307);
    assert.equal(res.headers.get('location'), 'http://localhost:3000/');
  }

  {
    const res = await middleware({
      nextUrl: { pathname: '/profile' },
      url: 'http://localhost:3000/profile',
    } as unknown as NextRequest);
    assert.equal(res.status, 307);
    assert.equal(res.headers.get('location'), 'http://localhost:3000/auth/login');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
