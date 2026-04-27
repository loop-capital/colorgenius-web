/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: '/home/jason/.openclaw/workspaces/colorgenius',
  images: {
    unoptimized: true,
    domains: ['localhost', 'cdn.colorgenius.com'],
  },
};

module.exports = nextConfig;
