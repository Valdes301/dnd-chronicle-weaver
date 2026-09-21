/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  experimental: {
    serverActions: {
      allowedOrigins: [
        '*.run.app',
        '*.*.run.app',
        '*.europe-west2.run.app',
        '*.us-central1.run.app',
        '*.google.com',
        '*.googleusercontent.com',
        '*.aistudio.google.com',
        '*.cloudworkstations.dev',
        'localhost:3000',
        'localhost:9002',
        '127.0.0.1:3000',
        'ais-dev-3bpnqvtjzp2ublttijaki3-835620404917.europe-west2.run.app',
        'ais-pre-3bpnqvtjzp2ublttijaki3-835620404917.europe-west2.run.app',
        'ais-dev-dx322vzhl2ejhjbizyv6r2-835620404917.europe-west2.run.app',
        'ais-pre-dx322vzhl2ejhjbizyv6r2-835620404917.europe-west2.run.app',
      ],
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

