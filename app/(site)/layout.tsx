// \app\(site)\layout.tsx

// app/(site)/layout.tsx

import HeaderSwitcher from '@/components/HeaderSwitcher'
import { Footer } from '@/components/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
