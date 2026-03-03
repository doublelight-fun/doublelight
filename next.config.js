/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["http://104.251.222.174:3000"],
  turbopack: {},
  serverExternalPackages: [
    '@coinbase/cdp-sdk',
    '@base-org/account',
    '@solana/kit',
    '@solana-program/system',
    '@solana-program/token',
  ],
};
module.exports = nextConfig;
