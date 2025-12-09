// app/(app)/layout.tsx
import type { ReactNode } from 'react'
import HeaderSwitcher from '@/components/HeaderSwitcher'
import { Footer } from '@/components/Footer'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col bg-slate-50">
      <HeaderSwitcher />
      <main className="flex-1 w-full pt-12 md:pt-16">
        {/* 顶部留出 Header 高度，避免内容被头部遮住 */}
        {children}
      </main>
      <Footer />
    </div>
  )
}

