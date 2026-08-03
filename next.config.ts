import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // Match any file inside the public/glb/ directory
        source: "/glb/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            // Allow any origin to fetch these 3D models
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
