import type { NextConfig } from "next";

// GitHub Pages serves the project site under /keystone-site; local builds and tests use "".
const basePath = process.env.KEYSTONE_BASE_PATH ?? "";

const config: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default config;
