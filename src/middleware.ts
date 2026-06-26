import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || 'a-very-long-secret-key-that-is-at-least-32-characters-long-for-security';
const KEY = new TextEncoder().encode(SESSION_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const isPublicPath = pathname === '/login' || pathname.startsWith('/_next/') || pathname === '/favicon.ico';

  const sessionCookie = request.cookies.get('session')?.value;

  let sessionPayload = null;
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, KEY, {
        algorithms: ['HS256'],
      });
      sessionPayload = payload;
    } catch {
      // Token invalid or expired
    }
  }

  // 1. If not authenticated and trying to access a protected path, redirect to login
  if (!sessionPayload && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    // Keep track of the original page to redirect back after login
    if (pathname !== '/' && pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated:
  if (sessionPayload) {
    const role = sessionPayload.role as string;
    const expiresAt = new Date(sessionPayload.expiresAt as string);

    // If session has expired, clear the cookie and redirect to login
    if (expiresAt < new Date()) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }

    // Redirect authenticated users away from login page
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // SKIP sliding session update for Next.js Server Actions to prevent header/cookie conflicts
    // that lead to "unexpected response was received from server" errors on POST requests.
    if (request.headers.has('next-action')) {
      return NextResponse.next();
    }

    // Sliding session update: extend expiration if less than 25 minutes left (1500 seconds)
    // Next.js middleware allows setting cookies on the response
    const expiresTime = expiresAt.getTime();
    const now = Date.now();
    const timeLeft = expiresTime - now;
    const SESSION_DURATION = 30 * 60 * 1000;

    if (timeLeft > 0 && timeLeft < SESSION_DURATION) {
      const newExpiresAt = new Date(now + SESSION_DURATION);
      const newPayload = { ...sessionPayload, expiresAt: newExpiresAt.toISOString() };
      
      // Re-sign token
      // We can sign a JWT using Web Crypto API. Since 'jose' is importable, we can do it:
      const jose = await import('jose');
      const newSessionToken = await new jose.SignJWT(newPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(Math.floor(newExpiresAt.getTime() / 1000))
        .sign(KEY);

      const response = NextResponse.next();
      response.cookies.set('session', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: newExpiresAt,
        path: '/',
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Protect all paths except for static files and standard next internal paths
  matcher: [
    '/((?!api/|static/|images/|_next/static/|_next/image/|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
