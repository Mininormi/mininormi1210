/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 原来的 RAYS 域名
      {
        protocol: 'https',
        hostname: 'www.rayswheels.co.jp',
      },

      // 新增的 Freepik 加拿大国旗图标域名
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.freepik.com',
      },

      // Cloudflare R2 CDN 域名（品牌Logo）
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-46d013ef97df4875bc41b321f1dc1294.r2.dev',
      },
    ],
  },
  
  // Docker 环境下的文件监听配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 启用轮询模式以支持 Docker 卷挂载的文件变化检测
      config.watchOptions = {
        poll: 1000, // 每秒轮询一次
        aggregateTimeout: 300, // 延迟 300ms 后重新构建
      }
    }
    return config
  },

  // 安全响应头配置（XSS 防护）
  async headers() {
    // 使用自定义环境变量 CSP_ENV 控制 CSP 模式
    // dev: 开发模式（允许 HMR/eval/inline）
    // prod: 生产模式（严格，但允许 inline 样式）
    // report-only: 生产测试模式（只报告不拦截）
    const cspEnv = process.env.CSP_ENV || 'dev'
    const isDev = cspEnv === 'dev'
    const isReportOnly = cspEnv === 'report-only'

    // 开发环境 CSP（允许 HMR、eval、inline scripts/styles）
    const devCSP = [
      "default-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* ws://localhost:* wss://localhost:*",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:*",
      "style-src 'self' 'unsafe-inline' http://localhost:*",
      "img-src 'self' data: https: http://localhost:*",
      "font-src 'self' data: http://localhost:*",
      "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*",
      "frame-ancestors 'none'",
    ].join('; ')

    // 生产环境 CSP（严格模式）
    // ⚠️ 重要：style-src 允许 'unsafe-inline'，因为 Next.js/React 会生成内联样式
    // 脚本仍然严格禁止 inline，只允许同源
    const prodCSP = [
      "default-src 'self'",
      "script-src 'self'",  // 脚本严格禁止 inline
      "style-src 'self' 'unsafe-inline'",  // 样式允许 inline（Next.js/React 需要）
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ')

    // 根据模式选择 CSP
    const cspValue = isDev ? devCSP : prodCSP
    const cspHeaderKey = isReportOnly 
      ? 'Content-Security-Policy-Report-Only' 
      : 'Content-Security-Policy'

    return [
      {
        // 应用到所有路由
        source: '/(.*)',
        headers: [
          {
            key: cspHeaderKey,
            value: cspValue,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
