import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@libsql/client', 'libsql'],
  turbopack: { root: process.cwd() },
  images: { formats: ['image/avif', 'image/webp'] },
};

export default nextConfig;
