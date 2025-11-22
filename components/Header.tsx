// components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 文字颜色：透明时白色，滚动后黑色
  const textColor = scrolled ? "text-slate-900" : "text-white";
  const subTextColor = scrolled ? "text-slate-600" : "text-white/70";

  return (
    <header
      className={`
    fixed top-0 left-0 w-full z-50
    transition-colors duration-150
    ${
      scrolled
        ? "bg-white/95 backdrop-blur border-b border-gray-200 shadow-md"
        : "bg-transparent border-b border-transparent shadow-none"
    }
  `}
    >
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between transition-all duration-300">
        {/* Logo 区域 */}
        <Link href="/" className="flex items-baseline gap-2">
          <span className={`text-xl font-black tracking-tight ${textColor}`}>
            Rimsurge
          </span>
          <span className={`text-xs font-medium uppercase ${subTextColor}`}>
            Wheels Only
          </span>
        </Link>

        {/* 导航栏 */}
        <nav
          className={`hidden gap-6 text-sm font-medium md:flex ${textColor}`}
        >
          <Link href="/aftermarket" className="hover:opacity-80">
            Aftermarket Wheels 改装轮毂
          </Link>
          <Link href="/oem" className="hover:opacity-80">
            OEM Wheels 原厂轮毂
          </Link>
          <Link href="/gallery" className="hover:opacity-80">
            Gallery 案例
          </Link>
          <Link href="/about" className="hover:opacity-80">
            About
          </Link>
        </nav>

        {/* 右侧按钮区域 */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className={`hidden text-sm md:inline-block hover:opacity-80 ${textColor}`}
          >
            Support
          </Link>

          {/* Shop Wheels 按钮：透明时使用黑底 → 更突出 */}
          <Link
            href="/aftermarket"
            className={`
              rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 
              ${
                scrolled
                  ? "bg-slate-900 text-white"
                  : "bg-white/90 text-slate-900"
              }
            `}
          >
            Shop Wheels
          </Link>
        </div>
      </div>
    </header>
  );
}
