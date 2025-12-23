import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy: Route Protection
 * 
 * Enforces session requirement for protected user routes.
 * Redirects unauthenticated users to login.
 */

export function proxy(request: NextRequest) {
  const session = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Protected routes: require session
  const protectedRoutes = ['/cart', '/checkout', '/account']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !session) {
    // Store the intended destination to redirect back after login
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/account/:path*',
  ],
}
