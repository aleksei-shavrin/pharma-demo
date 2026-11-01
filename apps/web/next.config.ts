import type { NextConfig } from "next";

/**
 * Keep `next build` off the live `next dev` cache.
 * Concurrent build+dev both writing `.next` causes:
 * "missing required error components, refreshing..."
 */
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Required for Compose image (`apps/web/Dockerfile` copies `.next/standalone`).
  output: "standalone",
};

export default nextConfig;
