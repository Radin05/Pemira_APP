import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    // Repo ini monorepo: ada package.json di root (skrip delegator) dan di sini.
    // Tanpa root eksplisit, Turbopack menebak dari lokasi lockfile dan bisa memilih
    // root repo, lalu gagal me-resolve modul. Kunci ke folder frontend.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
