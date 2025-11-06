/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'lh3.googleusercontent.com', 'covers.openlibrary.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gutenberg.org',
      },
      {
        protocol: 'http',
        hostname: 'www.gutenberg.org',
      },
    ],
    // Allow Base64 images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Add any other Next.js config options here
}

module.exports = nextConfig
