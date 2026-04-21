import type { NextConfig } from "next";

const backendUrl =
  process.env.NODE_ENV === "production"
    ? "https://shuttrspace-backend.onrender.com"
    : "http://localhost:8000"; // your local backend port

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default nextConfig;
