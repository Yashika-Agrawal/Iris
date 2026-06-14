import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['corsair'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
