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
            东街车房
          </span>
        </Link>

        {/* 中间导航 */}
        <nav className="hidden gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/wheels" className="hover:text-slate-900">
            Wheels 轮毂
          </Link>
          <Link href="/tires" className="hover:text-slate-900">
            Tires 轮胎
          </Link>
          <Link href="/about" className="hover:text-slate-900">
            About 关于我们
          </Link>
          <Link href="/blog" className="hover:text-slate-900">
            Blog
          </Link>
        </nav>

        {/* 右侧按钮区域 */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden text-sm text-slate-600 hover:text-slate-900 md:inline-block"
          >
            Contact
          </Link>
          <Link
            href="/shop"
            className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </header>
  );
}
