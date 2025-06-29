import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export const cookieName = "access_token";




export const setPersistentCookie = (token: string) => {
    const isProduction = process.env.NODE_ENV === 'production';

    setCookie(cookieName, token, {
        path: '/',
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 34560000000,
    });
};

export const getPersistentCookie = () => {
    return getCookie(cookieName);
};


export const deletePersistentCookie = () => {
    deleteCookie(cookieName, {
        path: '/',
        sameSite: 'lax',
    });
};


