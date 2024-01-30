/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-daisyui"],
  reactStrictMode: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
    serverComponentsExternalPackages: [
      "@coral-xyz/anchor",
      "@project-serum/anchor",
    ],
  },
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
};

export default nextConfig;
