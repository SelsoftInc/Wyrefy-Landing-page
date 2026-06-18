import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["wyrefy.io"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
