// components/HeaderDefault.tsx
'use client'

import Link from 'next/link'
import { HeaderRightNav } from './HeaderRightNav'
import { ShopWheelsDropdown } from './ShopWheelsDropdown'

export default function HeaderDefault() {
  // 非首页：一直是白底样式
  const textColor = 'text-slate-900'

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-200 shadow-md transition-colors duration-150">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 transition-all duration-300">
        {/* 左侧：Logo + SHOP WHEELS（和首页白底状态一致） */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900">Rimsurge</span>
          </Link>

          {/* 这里直接视作 scrolled = true，始终白底模式 */}
          <ShopWheelsDropdown scrolled={true} />
        </div>

        {/* 右侧：统一导航 */}
        <HeaderRightNav textColor={textColor} />
      </div>
    </header>
  )
}
