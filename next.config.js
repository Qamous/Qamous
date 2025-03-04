/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    // These are all the locales you want to support
    locales: ['en', 'ar'],
    // This is the default locale you want to be used when visiting
    // a non-locale prefixed path e.g. `/hello`
    defaultLocale: 'en',
  },
  // Configure image domains if needed
  images: {
    domains: [],
  },
  // Ensure we can use environment variables in the browser
  env: {
    VITE_API_URL: process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL,
  },
  // Webpack configuration to handle specific imports
  webpack(config) {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;