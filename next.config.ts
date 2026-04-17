import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    // Allow blob: URLs created by URL.createObjectURL for local file previews
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
