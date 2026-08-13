/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_LEGACY_ASSET_BASE: "https://ict-day-papers-quiz-fkwfcoa1p-nimesha.vercel.app",
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/quiz" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
