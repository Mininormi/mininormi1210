// app/(app)/profile/layout.tsx
'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ProfileLayout } from '@/components/ProfileLayout'

export default function ProfileLayoutWrapper({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-slate-600">加载中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <ProfileLayout>{children}</ProfileLayout>
}
