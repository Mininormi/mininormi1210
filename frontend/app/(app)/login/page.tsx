// app/(app)/login/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/context'

export default function LoginPage() {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()
  
  const { isAuthenticated, isLoading: authLoading, login: setAuthUser } = useAuth()

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, authLoading, router])

  // 加载中时显示加载状态，避免闪烁
  if (authLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-slate-600">加载中...</div>
      </div>
    )
  }

  // 如果已登录，不渲染登录表单（等待重定向）
  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!account.trim() || !password) {
      setError('请填写账号和密码')
      return
    }
    
    setError('')
    setIsLoading(true)

    try {
      const response = await login(account.trim(), password, rememberMe)
      // 登录成功，更新认证状态
      setAuthUser(response.user)
      // 跳转到首页或原页面
      router.push('/')
    } catch (err: any) {
      setError(err.detail || '登录失败，请检查账号和密码')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-md px-4 py-12 md:py-16">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Welcome back to Rimsurge
          </p>
        </div>

        {/* 登录表单卡片 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 错误提示 */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 账号输入（支持邮箱或用户名） */}
            <div>
              <label htmlFor="account" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Email or Username
              </label>
              <input
                id="account"
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                placeholder="your.email@example.com or username"
              />
            </div>

            {/* Password 输入 */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-slate-900 hover:text-slate-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/30 transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-slate-900 hover:text-slate-700">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}

