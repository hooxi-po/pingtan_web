/** @type {import('next').NextConfig} */
const nextConfig = {
  // 图片配置
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'api.map.baidu.com' },
      { protocol: 'https', hostname: 'map.baidu.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 编译配置
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ESLint配置
  eslint: {
    ignoreDuringBuilds: true,
  },

  // 压缩配置
  compress: true,

  // 头部配置（安全与CORS）
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // 路由重写
  async rewrites() {
    return [
      { source: '/api/baidu-map/:path*', destination: 'https://api.map.baidu.com/:path*' },
      { source: '/sitemap.xml', destination: '/api/sitemap' },
      { source: '/robots.txt', destination: '/api/robots' },
    ];
  },

  // 重定向
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/admin', destination: '/api/auth/signin', permanent: false },
    ];
  },

  // 运行时可用的环境变量透传到客户端
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 按需：包分析
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({ analyzerMode: 'server', analyzerPort: 8888, openAnalyzer: true })
      );
      return config;
    },
  }),
};

module.exports = nextConfig;