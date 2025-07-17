import { client } from "@/client/client.gen";

export const setupServerInterceptor = ({ token }: { token?: string | null }) => {
    if (!token) return;


    client.instance.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    client.instance.interceptors.request.clear();

    client.instance.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    return client;
};