import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
