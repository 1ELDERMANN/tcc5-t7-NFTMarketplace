/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: false,  // ← this disables Turbopack and forces classic Webpack
  },
};

export default nextConfig;