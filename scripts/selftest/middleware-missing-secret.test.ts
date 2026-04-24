import assert from 'node:assert/strict';

async function main() {
  delete process.env.NEXTAUTH_SECRET;
  const { middleware } = await import('../../middleware');

  {
    const res = await middleware({
      nextUrl: { pathname: '/auth/error' },
      url: 'http://localhost:3000/auth/error',
    } as any);
    assert.equal(res.headers.get('x-middleware-next'), '1');
  }

  {
    process.env.NEXTAUTH_SECRET = 'x';
    const res = await middleware({
      nextUrl: { pathname: '/auth/error' },
      url: 'http://localhost:3000/auth/error',
    } as any);
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
    } as any);
    assert.equal(res.status, 307);
    assert.equal(res.headers.get('location'), 'http://localhost:3000/');
  }

  {
    const res = await middleware({
      nextUrl: { pathname: '/admin' },
      url: 'http://localhost:3000/admin',
    } as any);
    assert.equal(res.status, 307);
    assert.equal(res.headers.get('location'), 'http://localhost:3000/');
  }

  {
    const res = await middleware({
      nextUrl: { pathname: '/profile' },
      url: 'http://localhost:3000/profile',
    } as any);
    assert.equal(res.status, 307);
    assert.equal(res.headers.get('location'), 'http://localhost:3000/auth/login');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
