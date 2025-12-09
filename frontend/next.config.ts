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
    ],
  },
}

export default nextConfig
