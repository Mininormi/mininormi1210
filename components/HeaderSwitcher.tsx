// \components\HeaderSwitcher.tsx

'use client'

import { usePathname } from 'next/navigation'
import HeaderHome from './HeaderHome'
import HeaderDefault from './HeaderDefault'

export default function HeaderSwitcher() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return isHome ? <HeaderHome /> : <HeaderDefault />
}
