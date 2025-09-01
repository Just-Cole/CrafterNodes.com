
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mineskin.eu',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'starlightskins.lunareclipse.studio',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hangarcdn.papermc.io',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'cdn.modrinth.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // No experimental flags needed for this setup currently
  },
};

export default nextConfig;
