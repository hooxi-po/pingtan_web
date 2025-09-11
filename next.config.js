/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack配置
  turbopack: {
    root: 'D:\\demoPT\\pingtan-tourism',
  },
  
  // 服务器外部包配置
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  // 图片配置
  images: {
    // 远程图片模式配置（替代已弃用的domains）
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'api.map.baidu.com',
      },
      {
        protocol: 'https',
        hostname: 'map.baidu.com',
      }
    ],
    // 图片格式
    formats: ['image/webp', 'image/avif'],
    // 图片尺寸
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 启用危险的SVG支持
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 编译配置
  compiler: {
    // 移除console.log
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 压缩配置
  compress: true,

  // 生成静态导出
  output: 'standalone',

  // 重写规则
  async rewrites() {
    return [
      {
        source: '/api/baidu-map/:path*',
        destination: 'https://api.map.baidu.com/:path*',
      },
    ];
  },

  // 重定向规则
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 头部配置
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // 环境变量
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack配置（仅在非Turbopack模式下使用）
  ...(!process.env.TURBOPACK && {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // 优化包大小
      if (!dev && !isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // 第三方库
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // 公共组件
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        };
      }

      return config;
    },
  }),

  // 性能预算
  onDemandEntries: {
    // 页面在内存中保留的时间（毫秒）
    maxInactiveAge: 25 * 1000,
    // 同时保留的页面数
    pagesBufferLength: 2,
  },



  // PWA配置（如果需要）
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },

  // 分析包大小（开发时使用）
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: 8888,
          openAnalyzer: true,
        })
      );
      return config;
    },
  }),
};

module.exports = nextConfig;