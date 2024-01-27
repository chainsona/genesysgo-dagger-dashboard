/** @type {import('next').NextConfig} */
import withSerwistInit from "@serwist/next";

const nextConfig = {
  transpilePackages: ["react-daisyui"],
  reactStrictMode: true,
};

const withSerwist = withSerwistInit({
  ...nextConfig,
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

export default nextConfig;
