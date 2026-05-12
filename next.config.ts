import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A-Frame and AR.js don't require special webpack config
};

// next.config.js
module.exports = {
  allowedDevOrigins: ['10.255.2.222'],
}

export default nextConfig;
