import { client } from "@/client/client.gen";
import { getPersistentCookie } from "./cookie";
import { isServer } from "@tanstack/react-query";

export const setupInterceptor = () => {
    client.instance.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    client.instance.interceptors.request.use(
        async (config) => {
            console.log(isServer, "isServer");
            if (!isServer) {
                config.headers.Authorization = `Bearer ${getPersistentCookie()}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Add response interceptor
    client.instance.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response?.status === 401) {
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }
    );
};