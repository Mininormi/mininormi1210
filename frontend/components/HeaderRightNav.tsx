// \components\HeaderRightNav.tsx

'use client'

import Link from 'next/link'

export function HeaderRightNav({ textColor }: { textColor: string }) {
  return (
    <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.12em]">
      <nav className={`hidden md:flex gap-8 text-xs font-semibold tracking-[0.16em] ${textColor}`}>
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

      </div>
    </div>
  )
}
