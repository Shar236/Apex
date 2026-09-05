import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/calculators/gre-to-gmat",
        destination: "/calculators/gre-to-gmat-conversion",
        permanent: true,
      },
      {
        source: "/calculators/toefl-to-ielts",
        destination: "/calculators/toefl-to-ielts-conversion",
        permanent: true,
      },
      {
        source: "/calculators/sat-to-act",
        destination: "/calculators/sat-to-act-conversion",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
