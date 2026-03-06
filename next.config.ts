import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy Firebase auth handler so OAuth popup shows auth.magnova.ai
      {
        source: '/__/auth/:path*',
        destination: 'https://magnova-a4210.firebaseapp.com/__/auth/:path*',
      },
    ];
  },
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://*.magnova.ai' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ],
    }];
  },
};

export default nextConfig;
