"use client";

import { client } from "@/client/client.gen";
import { getPersistentCookie, getPersistentTenantCookie } from "./cookie";

let isSetup = false;

export const setupClientInterceptor = () => {
  if (isSetup) return;

  client.instance.defaults.baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  client.instance.interceptors.request.use(
    async (config) => {
      const token = await getPersistentCookie();
      const tenantId = await getPersistentTenantCookie();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (tenantId) {
        config.headers.MessId = tenantId;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login?error=bad_credentials";
        }
      }
      return Promise.reject(error);
    }
  );

  isSetup = true;
};
