import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config: any) => {
    // A-Frame and AR.js don't require special webpack config
    return config;
  },
};

export default nextConfig;
