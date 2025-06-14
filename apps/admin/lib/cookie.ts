export const cookieName = "access_token";

export const setPersistentCookie = (token: string) => {
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieOptions = [
        `${cookieName}=${token}`,
        'path=/',
        'samesite=strict',
        ...(isProduction ? ['secure'] : []),
    ];

    document.cookie = cookieOptions.join('; ');
};

export const getPersistentCookie = () => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieName) {
            return value;
        }
    }
    return null;
}

export const deletePersistentCookie = () => {
    document.cookie = `${cookieName}=; path=/; samesite=strict; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
}

