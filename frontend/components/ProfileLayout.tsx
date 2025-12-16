// components/ProfileLayout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth/context'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/profile', label: '个人中心', icon: '👤' },
  { href: '/profile/orders', label: '我的订单', icon: '📦' },
  { href: '/cart', label: '购物车', icon: '🛒' },
  { href: '/profile/favorites', label: '我的收藏', icon: '❤️' },
  { href: '/profile/addresses', label: '收货地址', icon: '📍' },
  { href: '/profile/security', label: '账户与安全', icon: '🔒' },
  { href: '/profile/refunds', label: '售后与退款', icon: '↩️' },
  { href: '/profile/tickets', label: '服务工单', icon: '🎫' },
  { href: '/profile/coupons', label: '我的优惠', icon: '🎁' },
]

export function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            个人中心
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            欢迎回来，{user?.nickname || user?.username}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 侧边栏导航 */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  // 精确匹配或路径前缀匹配（排除 /profile 的精确匹配）
                  const isActive = pathname === item.href || 
                    (item.href !== '/profile' && item.href !== '/cart' && pathname.startsWith(item.href)) ||
                    (item.href === '/cart' && pathname === '/cart')
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                          ${
                            isActive
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
