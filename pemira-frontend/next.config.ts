import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" hanya untuk build Docker/VPS. Vercel pakai sistem serverless
  // sendiri dan tidak kompatibel dengan mode ini — biarkan default di Vercel.
  output: process.env.VERCEL ? undefined : "standalone",
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;