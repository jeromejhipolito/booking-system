/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@booking/shared-types',
    '@booking/shared-schemas',
    '@booking/shared-constants',
    '@booking/shared-utils',
  ],
};

module.exports = nextConfig;
