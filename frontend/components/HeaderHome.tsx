// components/HeaderHome.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HeaderRightNav } from './HeaderRightNav'
import { ShopWheelsDropdown } from './ShopWheelsDropdown'

export default function HeaderHome() {
  const [scrolled, setScrolled] = useState(false)

  // 监听滚动：决定 header 是透明还是白底
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const textColor = scrolled ? 'text-slate-900' : 'text-white'

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-150 ${
        scrolled
          ? 'bg-white/95 backdrop-blur border-b border-gray-200 shadow-md'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 transition-all duration-300">
        {/* 左侧：Logo + SHOP WHEELS */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-baseline gap-2">
            <span
              className={`text-xl font-black tracking-tight ${
                scrolled ? 'text-slate-900' : 'text-white'
              }`}
            >
              Rimsurge
            </span>
          </Link>

          <ShopWheelsDropdown scrolled={scrolled} />
        </div>

        {/* 右侧：复用导航 */}
        <HeaderRightNav textColor={textColor} />
      </div>
    </header>
  )
}
