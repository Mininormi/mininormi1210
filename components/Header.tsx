// components/Header.tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* 左侧 Logo / 品牌名 */}
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-black tracking-tight">
            Rimsurge
          </span>
          <span className="text-xs font-medium uppercase text-slate-500">
            Wheels Only
          </span>
        </Link>

        {/* 中间导航：只围绕轮毂 */}
        <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/aftermarket" className="hover:text-slate-900">
            Aftermarket Wheels 改装轮毂
          </Link>
          <Link href="/oem" className="hover:text-slate-900">
            OEM Wheels 原厂轮毂
          </Link>
          <Link href="/gallery" className="hover:text-slate-900">
            Gallery 案例
          </Link>
          <Link href="/about" className="hover:text-slate-900">
            About
          </Link>
        </nav>

        {/* 右侧操作区域：后面可以挂购物车 / 登录 */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden text-sm text-slate-600 hover:text-slate-900 md:inline-block"
          >
            Support
          </Link>
          <Link
            href="/aftermarket"
            className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Shop Wheels
          </Link>
        </div>
      </div>
    </header>
  );
}
