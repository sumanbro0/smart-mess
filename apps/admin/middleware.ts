import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookieName } from './lib/cookie'


export function middleware(request: NextRequest) {


    if (request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.next()
    }

    const cookie = request.cookies.get(cookieName || '')

    if (!cookie) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()

}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ]
} 