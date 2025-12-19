
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    // Check if the user is explicitly starting the app
    if (request.nextUrl.searchParams.get('start') === 'true') {
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.set('weeklist-welcome-seen', 'true', { path: '/', maxAge: 31536000 })
        return response
    }

    // Check if the user has visited before
    const hasSeenWelcome = request.cookies.has('weeklist-welcome-seen')

    // If no cookie and not on welcome page (and is root path), redirect to welcome
    if (!hasSeenWelcome && request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/welcome', request.url))
    }

    // If user is on welcome page but has seen it (cookie exists),
    // we could redirect to home, but user specifically asked:
    // "redirect should not happen. However, the user should be able to see the landing page again if they want"
    // So we allow access to /welcome even if cookie exists.

    return NextResponse.next()
}

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
