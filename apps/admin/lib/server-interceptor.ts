import { client } from "@/client/client.gen";

export const setupServerInterceptor = ({ token, tenantId }: { token?: string | null, tenantId?: string | null }) => {
    if (!token) return;

    // Clear and setup fresh interceptors for server
    client.instance.interceptors.request.clear();
    client.instance.interceptors.response.clear();

    client.instance.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    client.instance.interceptors.request.use((config) => {
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (tenantId) {
            config.headers.MessId = tenantId;
        }
        return config;
    });

    return client;
};