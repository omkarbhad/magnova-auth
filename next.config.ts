import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://magnova-a4210.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
};

export default nextConfig;
