// components/HeaderHome.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type MenuKey = 'vehicle' | 'pcd' | 'brand'

export default function HeaderHome() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pinned, setPinned] = useState(false) // 是否锁定展开
  const [activeItem, setActiveItem] = useState<MenuKey>('vehicle')

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)

  // 监听滚动：决定 header 是透明还是白底
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  // 点击外部：关闭 + 取消锁定
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(e.target as Node)) {
        clearCloseTimeout()
        setMenuOpen(false)
        setPinned(false)
      }
    }

    if (menuOpen || pinned) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      clearCloseTimeout()
    }
  }, [menuOpen, pinned])

  const textColor = scrolled ? 'text-slate-900' : 'text-white'

  const buttonBase =
    'rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 flex items-center gap-2'
  const buttonColor = scrolled ? 'bg-slate-900 text-white' : 'bg-white/92 text-slate-900'

  // 下拉主题跟随 header
  const dropdownTheme = scrolled
    ? // 白底状态：浅色卡片
      'bg-white/98 text-slate-900 border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.16)]'
    : // 透明状态：深色玻璃
      'bg-[rgba(8,18,35,0.78)] text-slate-50 border-white/10 backdrop-blur-2xl shadow-[0_26px_70px_rgba(15,23,42,0.85)]'

  const dropdownMutedText = scrolled ? 'text-slate-500' : 'text-slate-300'
  const dropdownActiveBg = scrolled ? 'bg-slate-100/80' : 'bg-slate-800/80'
  const dropdownInactiveBg = scrolled ? 'hover:bg-slate-100/80' : 'hover:bg-slate-800/60'

  // 点击按钮：锁定 / 取消锁定
  const handleToggleClick = () => {
    if (pinned) {
      setPinned(false)
      setMenuOpen(false)
    } else {
      setPinned(true)
      setMenuOpen(true)
    }
  }

  // 悬停进入按钮或 mega-menu：临时打开
  const handleMouseEnter = () => {
    clearCloseTimeout()
    if (!pinned) setMenuOpen(true)
  }

  // 悬停离开：如果没锁定则延迟关闭，避免“刚要点就消失”
  const handleMouseLeave = () => {
    if (pinned) return
    clearCloseTimeout()
    closeTimeoutRef.current = window.setTimeout(() => {
      setMenuOpen(false)
      closeTimeoutRef.current = null
    }, 220)
  }

  // 右侧内容文案
  const detail = {
    vehicle: {
      title: 'By Vehicle Search',
      body: [
        'Enter your vehicle details and only see wheels that clear your brakes, hub and fenders.',
        'No more guessing offsets or test-fitting.',
      ],
    },
    pcd: {
      title: 'By PCD Search',
      body: [
        'Already know your bolt pattern? Filter by PCD to see every wheel that physically bolts up.',
        'Optionally limit by wheel diameter to match your target size.',
      ],
    },
    brand: {
      title: 'By Brand Search',
      body: [
        'Browse wheels by manufacturer when you already have a favourite brand in mind.',
        'We only list authentic stock that is ready to ship to Canada with duties included.',
      ],
    },
  } as const

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

          {/* SHOP WHEELS + mega menu */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={handleToggleClick}
              className={`${buttonBase} ${buttonColor}`}
            >
              <span>SHOP WHEELS</span>
              <span
                className={`text-[10px] transition-transform ${
                  menuOpen ? 'rotate-180' : 'rotate-0'
                }`}
              >
                ▼
              </span>
            </button>

            {menuOpen && (
              <div
                className={`
                  absolute left-0 mt-6 w-[720px] max-w-[calc(100vw-2rem)]
                  rounded-3xl border
                  ${dropdownTheme}
                  animate-[menuFadeIn_0.18s_ease-out]
                `}
              >
                <div className="flex flex-col gap-0 p-4 sm:flex-row sm:gap-6 sm:p-6">
                  {/* 左侧：三个选项 */}
                  <div className="w-full flex-1 space-y-1">
                    {/* By Vehicle */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveItem('vehicle')}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                        activeItem === 'vehicle' ? dropdownActiveBg : dropdownInactiveBg
                      }`}
                    >
                      <div className="text-sm font-semibold">By Vehicle</div>
                      <div className={`mt-1 text-xs ${dropdownMutedText}`}>
                        Search wheels by exact fitment
                      </div>
                    </button>

                    {/* By PCD */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveItem('pcd')}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                        activeItem === 'pcd' ? dropdownActiveBg : dropdownInactiveBg
                      }`}
                    >
                      <div className="text-sm font-semibold">By PCD</div>
                      <div className={`mt-1 text-xs ${dropdownMutedText}`}>
                        Find wheels by bolt pattern
                      </div>
                    </button>

                    {/* By Brand */}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveItem('brand')}
                      className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                        activeItem === 'brand' ? dropdownActiveBg : dropdownInactiveBg
                      }`}
                    >
                      <div className="text-sm font-semibold">By Brand</div>
                      <div className={`mt-1 text-xs ${dropdownMutedText}`}>
                        Browse wheels by manufacturer
                      </div>
                    </button>
                  </div>

                  {/* 右侧：详情卡片 */}
                  <div className="mt-4 w-full flex-1 rounded-3xl bg-white text-slate-900 shadow-inner/10 sm:mt-0 sm:ml-2 sm:px-0 sm:py-0">
                    <div className="flex h-full flex-col gap-4 rounded-3xl bg-white px-6 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
                      {/* RS 圆形标记 */}
                      <div className="flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold text-slate-500">
                          RS
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold">{detail[activeItem].title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{detail[activeItem].body[0]}</p>
                        <p className="mt-1 text-sm text-slate-600">{detail[activeItem].body[1]}</p>
                      </div>

                      {/* 行为按钮：根据 activeItem 跳链接 */}
                      <div className="mt-3">
                        {activeItem === 'vehicle' && (
                          <Link
                            href="/shop/by-vehicle"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 underline underline-offset-4"
                            onClick={() => {
                              setMenuOpen(false)
                              setPinned(false)
                            }}
                          >
                            Start vehicle search →
                          </Link>
                        )}
                        {activeItem === 'pcd' && (
                          <Link
                            href="/shop/by-pcd"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 underline underline-offset-4"
                            onClick={() => {
                              setMenuOpen(false)
                              setPinned(false)
                            }}
                          >
                            Start PCD search →
                          </Link>
                        )}
                        {activeItem === 'brand' && (
                          <Link
                            href="/shop/by-brand"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 underline underline-offset-4"
                            onClick={() => {
                              setMenuOpen(false)
                              setPinned(false)
                            }}
                          >
                            Browse by brand →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：导航 + 分割线 + 登录/购物车/结账 */}
        <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.12em]">
          <nav
            className={`hidden md:flex gap-8 text-xs font-semibold tracking-[0.16em] ${textColor}`}
          >
            <Link href="/gallery" className="hover:opacity-80">
              GALLERY
            </Link>
            <Link href="/about" className="hover:opacity-80">
              ABOUT
            </Link>
            <Link href="/support" className="hover:opacity-80">
              SUPPORT
            </Link>
          </nav>

          <div className="hidden h-4 w-px bg-slate-400/40 md:block" />

          <div className={`hidden items-center gap-4 md:flex ${textColor}`}>
            <Link href="/login" className="hover:opacity-80">
              LOG IN
            </Link>
            <Link href="/cart" className="hover:opacity-80">
              CART (0)
            </Link>
            <Link href="/checkout" className="hover:opacity-80">
              CHECKOUT
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
