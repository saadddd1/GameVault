import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  compress: false, // nginx 处理 gzip

  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src * data:; connect-src 'self'; font-src 'self'; frame-src 'self';" },
      ],
    },
  ],

  // 图片不经过 Next.js 优化（1C1G 受不了），直接走 nginx
  images: {
    unoptimized: true,
  },
}

export default nextConfig
