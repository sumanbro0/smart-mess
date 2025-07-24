import { client } from "@/client/client.gen";

export const setupServerInterceptor = ({ token }: { token?: string | null }) => {
    client.instance.interceptors.request.clear();

    if (!token) {
        return client;
    }


    client.instance.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    client.instance.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    return client;
};