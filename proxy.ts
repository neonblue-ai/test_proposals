import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Lightweight proxy — just redirects unauthenticated users to /login
// Real session validation happens in Server Components via auth()
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth routes and login page
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Check for session cookie (next-auth sets this)
  const sessionCookie =
    request.cookies.get('authjs.session-token') ||
    request.cookies.get('__Secure-authjs.session-token')

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
