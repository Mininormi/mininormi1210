// app/(app)/register/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register, sendVerificationCode } from '@/lib/api/auth'
import { useAuth } from '@/lib/auth/context'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: '',
  })
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, login: setAuthUser } = useAuth()

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, authLoading, router])

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // 加载中时显示加载状态，避免闪烁
  if (authLoading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-slate-600">加载中...</div>
      </div>
    )
  }

  // 如果已登录，不渲染注册表单（等待重定向）
  if (isAuthenticated) {
    return null
  }

  /**
   * 发送验证码
   */
  const handleSendCode = async () => {
    if (!formData.email.trim()) {
      setErrors({ ...errors, email: '请先输入邮箱地址' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ ...errors, email: '请输入有效的邮箱地址' })
      return
    }

    setIsSendingCode(true)
    setErrors({ ...errors, email: '', verificationCode: '' })

    try {
      const response = await sendVerificationCode(formData.email.trim(), 'register')
      // 使用后端返回的冷却时间，如果没有则使用默认60秒
      setCountdown(response.rate_limit_seconds || 60)
    } catch (err: any) {
      // 显示后端返回的错误信息
      const errorMessage = err.detail || '发送验证码失败'
      setErrors({ ...errors, verificationCode: errorMessage })
      // 如果是限流错误，尝试从错误信息中提取剩余时间
      if (err.status === 429) {
        // 429 错误表示限流，后端会返回剩余时间信息
        // 如果错误信息包含剩余时间，解析并设置倒计时
        const match = errorMessage.match(/剩余 (\d+) 秒/)
        if (match) {
          setCountdown(parseInt(match[1]))
        } else {
          // 如果没有剩余时间信息，设置默认60秒
          setCountdown(60)
        }
      }
    } finally {
      setIsSendingCode(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else {
      const username = formData.username.trim().toLowerCase()
      if (username.length < 3 || username.length > 30) {
        newErrors.username = 'Username must be 3-30 characters'
      } else if (!/^[a-z0-9_]+$/.test(username)) {
        newErrors.username = 'Username can only contain lowercase letters, numbers, and underscores'
      } else if (username.includes('@')) {
        newErrors.username = 'Username cannot contain @ symbol'
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.verificationCode.trim()) {
      newErrors.verificationCode = 'Verification code is required'
    } else if (!/^\d{6}$/.test(formData.verificationCode.trim())) {
      newErrors.verificationCode = 'Verification code must be 6 digits'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const registerData = {
        email: formData.email.trim(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        nickname: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
        verification_code: formData.verificationCode.trim(),
      }
      const response = await register(registerData)
      // 注册成功，自动登录
      setAuthUser(response.user)
      // 跳转到首页
      router.push('/')
    } catch (err: any) {
      const errorMessage = err.detail || '注册失败，请稍后再试'
      // 如果是验证码错误，显示在验证码字段
      if (errorMessage.includes('验证码')) {
        setErrors({ ...errors, verificationCode: errorMessage })
      } else if (errorMessage.includes('用户名')) {
        // 如果是用户名相关错误，显示在用户名字段
        setErrors({ ...errors, username: errorMessage })
      } else {
        setErrors({ ...errors, submit: errorMessage })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    // 清除该字段的错误
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-md px-4 py-12 md:py-16">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Join Rimsurge and start shopping for authentic wheels
          </p>
        </div>

        {/* 注册表单卡片 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 提交错误提示 */}
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {errors.submit}
              </div>
            )}
            {/* 姓名 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-slate-900">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                  className={`w-full rounded-lg border ${
                    errors.firstName ? 'border-red-300' : 'border-slate-300'
                  } bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-slate-900">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                  className={`w-full rounded-lg border ${
                    errors.lastName ? 'border-red-300' : 'border-slate-300'
                  } bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Username 输入 */}
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Username *
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
                className={`w-full rounded-lg border ${
                  errors.username ? 'border-red-300' : 'border-slate-300'
                } bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20`}
                placeholder="username123"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-600">{errors.username}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                3-30 characters, lowercase letters, numbers, and underscores only
              </p>
            </div>

            {/* Email 输入 */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className={`w-full rounded-lg border ${
                  errors.email ? 'border-red-300' : 'border-slate-300'
                } bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* 验证码输入 */}
            <div>
              <label htmlFor="verificationCode" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Verification Code *
              </label>
              <div className="flex gap-2">
                <input
                  id="verificationCode"
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => handleChange('verificationCode', e.target.value)}
                  required
                  maxLength={6}
                  className={`flex-1 rounded-lg border ${
                    errors.verificationCode ? 'border-red-300' : 'border-slate-300'
                  } bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20`}
                  placeholder="6位验证码"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || countdown > 0}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSendingCode
                    ? '发送中...'
                    : countdown > 0
                    ? `${countdown}秒`
                    : '发送验证码'}
                </button>
              </div>
              {errors.verificationCode && (
                <p className="mt-1 text-xs text-red-600">{errors.verificationCode}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                验证码将发送到您的邮箱，有效期为 5 分钟。发送后需等待 1 分钟才能再次发送。
              </p>
            </div>

            {/* Password 输入 */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  className={`w-full rounded-lg border ${
                    errors.password ? 'border-red-300' : 'border-slate-300'
                  } bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20`}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm Password 输入 */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-900">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  className={`w-full rounded-lg border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                  } bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* 同意条款 */}
            <div>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => {
                    setAgreeToTerms(e.target.checked)
                    if (errors.terms) {
                      setErrors({ ...errors, terms: '' })
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-600">
                  I agree to the{' '}
                  <Link href="/terms" className="font-semibold text-slate-900 hover:text-slate-700 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-semibold text-slate-900 hover:text-slate-700 underline">
                    Privacy Policy
                  </Link>
                  *
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-xs text-red-600">{errors.terms}</p>
              )}
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/30 transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        {/* 登录链接 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-slate-900 hover:text-slate-700">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}

