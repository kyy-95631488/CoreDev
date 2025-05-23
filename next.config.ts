import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iwxecxadsjmiofmemcga.supabase.co',
        pathname: '/storage/v1/object/public/thumbnails/**',
      },
    ],
  },
};

export default nextConfig;
