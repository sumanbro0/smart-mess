"use client";

import { client } from "@/client/client.gen";
import { getPersistentCookie } from "./cookie";

export const setupClientInterceptor = () => {
  client.instance.interceptors.request.clear();
  client.instance.defaults.baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  client.instance.interceptors.request.use(
    (config) => {
      const token = getPersistentCookie();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};
