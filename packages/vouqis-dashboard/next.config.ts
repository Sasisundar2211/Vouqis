import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// Only set turbopack root when running inside the monorepo (local dev).
// On Vercel the build root IS packages/vouqis-dashboard, so no parent packages/ dir exists.
const monorepoRoot = path.resolve(__dirname, "../..");
const inMonorepo = fs.existsSync(path.join(monorepoRoot, "packages"));

const nextConfig: NextConfig = {
  ...(inMonorepo && {
    turbopack: {
      root: monorepoRoot,
    },
  }),
};

export default nextConfig;
