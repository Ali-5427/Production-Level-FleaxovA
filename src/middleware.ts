
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define paths that are public and don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/services', // Listing page
    /^\/services\/[^/]+$/, // Detail pages like /services/123
    '/jobs', // Listing page
    /^\/jobs\/[^/]+$/ // Detail pages like /jobs/123
  ];

  const isPublicPath = publicPaths.some(p => 
    typeof p === 'string' ? p === path : p.test(path)
  );

  // Get the session cookie
  const sessionCookie = request.cookies.get('__session');

  // If it's not a public path and there's no session cookie, redirect to login
  if (!isPublicPath && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If user is logged in (has session) and tries to go to login/register, redirect to dashboard
  if (sessionCookie && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
