import type { NextConfig } from "next";

const backendUrl =
  process.env.NODE_ENV === "production"
    ? "https://shuttrspace-backend.onrender.com"
    : "http://localhost:8000"; // your local backend port

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
