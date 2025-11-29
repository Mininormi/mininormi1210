// app/admin/layout.tsx
import type { ReactNode } from 'react'
import { Suspense } from 'react'

// 全局样式（非 client 组件里引）
import '@refinedev/antd/dist/reset.css'
import 'antd/dist/reset.css'

import { AdminApp } from './AdminApp'

// 整个 admin 段落强制动态，别给我预渲染
export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminApp>{children}</AdminApp>
    </Suspense>
  )
}
