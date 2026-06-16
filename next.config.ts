import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Throttled VPS (high CPU steal) renders slowly; raise per-page build timeout.
  staticPageGenerationTimeout: 900,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

// Cap the on-disk ISR cache so it cannot fill the disk (see cache-handler.js).
(nextConfig as Record<string, unknown>).cacheHandler = path.join(process.cwd(), "cache-handler.js");
(nextConfig as Record<string, unknown>).cacheMaxMemorySize = 0;

export default nextConfig;
