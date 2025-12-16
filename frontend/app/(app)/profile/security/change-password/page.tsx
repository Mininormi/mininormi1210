// app/(app)/profile/security/change-password/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // 验证
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('请填写所有字段')
      return
    }

    if (formData.newPassword.length < 8) {
      setError('新密码长度至少8位')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (formData.oldPassword === formData.newPassword) {
      setError('新密码不能与旧密码相同')
      return
    }

    setIsLoading(true)

    try {
      // TODO: 调用 API 修改密码
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.message || '修改密码失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link
        href="/profile/security"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        ← 返回账户与安全
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">修改密码</h2>

        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              密码修改成功！
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              当前密码
            </label>
            <input
              type="password"
              value={formData.oldPassword}
              onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="请输入当前密码"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              新密码
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="请输入新密码（至少8位）"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-slate-500">
              密码长度至少8位，建议包含字母、数字和特殊字符
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              确认新密码
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="请再次输入新密码"
              required
              minLength={8}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '修改中...' : '确认修改'}
            </button>
            <Link
              href="/profile/security"
              className="px-6 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
