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
  /** Hide dev StaticIndicator (lightning / ISR badge). `buildActivity` stays default (bottom-right "building…"). */
  devIndicators: {
    appIsrStatus: false,
  },
  /** ECharts ships modern ESM that Turbopack must transpile. */
  transpilePackages: ["echarts"],
};

export default nextConfig;
