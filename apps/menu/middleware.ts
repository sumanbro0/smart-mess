import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookieName } from './lib/cookie'


export function middleware(request: NextRequest) {


    if (request.nextUrl.pathname.includes('/orders')) {
        const cookie = request.cookies.get(cookieName || '')
        const segs = request.nextUrl.pathname.split('/').filter(Boolean)
        const table = segs[1]
        const subdomain = segs[0]
        if (!cookie) {
            const loginUrl = new URL(`/${subdomain}/login?t=${table}&err=unauth`, request.url)
            return NextResponse.redirect(loginUrl)
        }
    }



    return NextResponse.next()

}

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ]
} 