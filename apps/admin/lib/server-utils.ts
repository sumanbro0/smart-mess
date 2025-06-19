"use server"

import { cookies } from "next/headers"
import { cookieName } from "./cookie"

export const getServerToken = async () => {
    const cookieStore = await cookies()
    return cookieStore.get(cookieName)?.value
}

export const setServerCookie = async (token: string) => {
    const isProduction = process.env.NODE_ENV === 'production';
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