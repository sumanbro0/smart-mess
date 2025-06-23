import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        protocol: "http",
      },
      {
        hostname: "github.com",
        protocol: "https",
      },
      {
        hostname: "127.0.0.1",
        protocol: "http",
      },
    ],
  },
};

export default nextConfig;
