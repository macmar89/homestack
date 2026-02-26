import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch (e) {
        return null
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Ignore static files and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next()
    }

    let accessToken = request.cookies.get('access_token')?.value
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

    let response = NextResponse.next()

    console.log(request.cookies.get('refresh_token'))
    console.log(refreshToken)

    if (!isPublicPage && refreshToken) {
        let isExpired = true
        if (accessToken) {
            const decoded = parseJwt(accessToken)
            if (decoded && decoded.exp) {
                // Check if token is expired, adding a 10 second buffer
                isExpired = decoded.exp * 1000 < Date.now() + 10000
            }
        }

        if (isExpired) {
            try {
                const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        Cookie: `refresh_token=${refreshToken}`,
                    },
                })

                if (refreshRes.ok) {
                    const setCookieHeader = refreshRes.headers.get('set-cookie')
                    if (setCookieHeader) {
                        response.headers.set('Set-Cookie', setCookieHeader)

                        const newCookies = setCookieHeader.split(',').reduce((acc, cookieStr) => {
                            const [fullMatch, name, value] = cookieStr.match(/([^=]+)=([^;]+)/) || []
                            if (name && value) {
                                acc[name.trim()] = value.trim()
                            }
                            return acc
                        }, {} as Record<string, string>)

                        if (newCookies['access_token']) {
                            request.cookies.set('access_token', newCookies['access_token'])
                            // Re-create response object with the updated request headers
                            // This ensures the injected cookie is passed to downstream layout/pages
                            response = NextResponse.next({
                                request: {
                                    headers: request.headers,
                                }
                            })
                            // We must also re-apply the Set-Cookie header to the new response
                            response.headers.set('Set-Cookie', setCookieHeader)
                        }
                    }
                } else if (!isPublicPage) {
                    // Refresh failed (e.g., refresh token also expired), redirect to login
                    const loginUrl = new URL('/', request.url)
                    return NextResponse.redirect(loginUrl)
                }
            } catch (error) {
                if (!isPublicPage) {
                    const loginUrl = new URL('/', request.url)
                    return NextResponse.redirect(loginUrl)
                }
            }
        }
    }

    return response
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