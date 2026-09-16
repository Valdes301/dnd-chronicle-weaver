/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: ['*.run.app', '*.cloudworkstations.dev', 'localhost:3000', 'localhost:9002', '127.0.0.1:3000'],
      bodySizeLimit: '50mb',
    },
  },
  serverExternalPackages: ['better-sqlite3'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false;
      config.optimization.minimize = false;
    }
    return config;
  },
};

module.exports = nextConfig;

