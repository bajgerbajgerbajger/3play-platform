import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token;

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!token || token.role !== 'ADMIN') {
        console.log('Middleware: Redirecting from admin, role is:', token?.role);
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Protect profile routes
    if (request.nextUrl.pathname.startsWith('/profile')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    // Protect settings routes
    if (request.nextUrl.pathname.startsWith('/settings')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    // Protect watchlist routes
    if (request.nextUrl.pathname.startsWith('/watchlist')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const publicRoutes = [
          '/api/auth',
          '/api/health',
          '/api/movies',
          '/api/series',
          '/api/episodes',
          '/api/search',
          '/auth/login',
          '/auth/register',
          '/auth/error',
          '/auth/forgot-password',
          '/',
          '/browse',
          '/search',
          '/movies',
          '/series',
          '/watch',
          '/help',
          '/about',
          '/privacy',
          '/terms',
          '/pricing',
        ];

        if (
          publicRoutes.some((route) =>
            req.nextUrl.pathname.startsWith(route)
          )
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|public/|uploads/).*)'],
};
