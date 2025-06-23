"use server"

import { cookies } from "next/headers"
import { cookieName, tenantCookieName } from "./cookie"
const isProduction = process.env.NODE_ENV === 'production';

export const getServerToken = async () => {
    const cookieStore = await cookies()
    return cookieStore.get(cookieName)?.value
}

export const setServerCookie = async (token: string) => {
    const cookieStore = await cookies()
    cookieStore.set(cookieName, token, {
        path: '/',
        sameSite: 'lax',
        secure: isProduction,
    })
}

export const deleteServerCookie = async () => {
    const cookieStore = await cookies()
    cookieStore.delete(cookieName)
}

export const getServerTenantId = async () => {
    const cookieStore = await cookies()
    return cookieStore.get(tenantCookieName)?.value
}

export const setServerTenantId = async (tenantId: string | null) => {
    if (!tenantId) {

        return;
    }
    const cookieStore = await cookies()
    cookieStore.set(tenantCookieName, tenantId, {
        path: '/',
        sameSite: 'lax',
        secure: isProduction,
    })
}

export const deleteServerTenantId = async () => {
    const cookieStore = await cookies()
    cookieStore.delete(tenantCookieName)
}