/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isPages ? "/Days-paper" : "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_LEGACY_ASSET_BASE: "https://ict-day-papers-quiz-fkwfcoa1p-nimesha.vercel.app",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
