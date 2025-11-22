/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.rayswheels.co.jp',
        // pathname: '/lacne/news/upload/new_arrival/**', // 想更严一点可以加这行
      },
    ],
  },
}

export default nextConfig
