/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.tmj$/,
      type: 'asset/resource'
    });
    return config;
  }
}

module.exports = nextConfig 