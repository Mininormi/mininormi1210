// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rimsurge · 东街车房',
  description: 'Rimsurge · 东街车房，专注 JDM / 欧系轮毂与改装配件的跨境电商站点。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className="relative bg-white overflow-x-hidden">
        <div className="relative z-10 flex min-h-screen flex-col">
          {/* 顶部留出 Header 高度，避免内容被盖住 */}
          <main className="flex-1 w-full">{children}</main>
        </div>
      </body>
    </html>
  )
}
