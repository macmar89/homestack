import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const accessToken = request.cookies.get('access_token')?.value
    const refreshToken = request.cookies.get('refresh_token')?.value

    const isPublicPage =
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/forgot-password'

    if (!isPublicPage && !accessToken && !refreshToken) {
        const loginUrl = new URL('/', request.url)

        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // Enable a comprehensive matcher to ensure all paths are processed
        // Match all request paths except for the ones starting with:
        // - api (API routes)
        // - _next/static (static files)
        // - _next/image (image optimization files)
        // - favicon.ico (favicon file)
        // - OneSignalSDKWorker.js & OneSignalSDK.sw.js (OneSignal service workers)
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|OneSignalSDKWorker.js|OneSignalSDK.sw.js).*)',
    ],
}