import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Role → allowed path prefixes mapping.
 * Middleware performs a lightweight JWT payload decode (base64, no crypto)
 * to extract the role. Real signature verification happens on the API Gateway.
 */
const ROLE_ROUTES: Record<string, string[]> = {
  SUPER_ADMIN: ['/super-admin', '/admin'],
  SCHOOL_ADMIN: ['/admin'],
  TEACHER: ['/teacher'],
  STUDENT: ['/student'],
  PARENT: ['/parent'],
};


/** Decode JWT payload without verifying signature (edge-safe, fast). */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Base64url → base64 → JSON
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths that need protection
  const protectedPrefixes = ['/admin', '/teacher', '/student', '/super-admin', '/parent'];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  const isAuthPage =
    pathname === '/login' ||
    pathname.startsWith('/login') ||
    pathname === '/register' ||
    pathname.startsWith('/register');

  const token = request.cookies.get('edusocrates_token')?.value;

  // ── No token ────────────────────────────────────────────────────────────── //
  if (!token) {
    if (isProtected) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // ── Has token ────────────────────────────────────────────────────────────── //
  const payload = decodeJwtPayload(token);

  // Malformed / expired token — clear cookie and redirect
  if (!payload) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('edusocrates_token');
    return res;
  }

  // Check expiry
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('edusocrates_token');
    return res;
  }

  const role: string = payload.role || '';

  // Already logged in — redirect away from login/register pages
  if (isAuthPage) {
    const dest = getDefaultRoute(role);
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Role-based path enforcement
  if (isProtected) {
    const allowedPrefixes = ROLE_ROUTES[role] || [];
    const isAllowed = allowedPrefixes.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      // Redirect to their own dashboard, not login
      const dest = getDefaultRoute(role);
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

function getDefaultRoute(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'SCHOOL_ADMIN':
      return '/admin';
    case 'TEACHER':
      return '/teacher';
    case 'PARENT':
      return '/parent';
    case 'STUDENT':
    default:
      return '/student';
  }
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/super-admin/:path*',
    '/parent/:path*',
  ],
};


