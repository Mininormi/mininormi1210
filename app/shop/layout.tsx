// app/shop/layout.tsx
import type { ReactNode } from 'react'
import HeaderSwitcher from '@/components/HeaderSwitcher'
import { Footer } from '@/components/Footer'

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <HeaderSwitcher />
      <main className="flex-1 w-full">
        {/* 顶部留出 Header 高度，避免内容被盖住 */}
        {children}
      </main>
      <Footer />
    </div>
  )
}
