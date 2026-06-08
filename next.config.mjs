/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.weserv.nl", "corsproxy.io"],
  },
};

export default nextConfig;
