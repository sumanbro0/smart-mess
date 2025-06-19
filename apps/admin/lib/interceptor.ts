import { client } from "@/client/client.gen";
import { getPersistentCookie } from "./cookie";


export const setupInterceptor = (token: string | null = null) => {
    client.instance.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    client.instance.interceptors.request.use(
        (config) => {
            config.headers.Authorization = `Bearer ${token || getPersistentCookie()}`;


            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    client.instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response?.status === 401 || error.response?.status === 403) {
                if (!window.location.pathname.includes("/login")) {
                    window.location.href = "/login?error=bad_credentials";
                }
            }
            return Promise.reject(error);
        }
    );
};