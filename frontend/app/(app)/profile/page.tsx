// app/(app)/profile/page.tsx
'use client'

import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      // 使用 useAuth().logout() 确保状态同步
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  const quickActions = [
    { href: '/profile/orders', label: '我的订单', icon: '📦', desc: '查看订单状态' },
    { href: '/cart', label: '购物车', icon: '🛒', desc: '查看购物车' },
    { href: '/profile/favorites', label: '我的收藏', icon: '❤️', desc: '收藏的商品' },
    { href: '/profile/addresses', label: '收货地址', icon: '📍', desc: '管理地址' },
  ]

  return (
    <div className="space-y-8">
      {/* 用户信息卡片 */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">基本信息</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-2xl">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{user?.nickname || user?.username}</h3>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-600">用户名</span>
              <span className="text-sm text-slate-900">{user?.username}</span>
            </div>
            {user?.nickname && (
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">昵称</span>
                <span className="text-sm text-slate-900">{user.nickname}</span>
              </div>
            )}
            {user?.email && (
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">邮箱</span>
                <span className="text-sm text-slate-900">{user.email}</span>
              </div>
            )}
            {user?.mobile && (
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-600">手机号</span>
                <span className="text-sm text-slate-900">{user.mobile}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="text-3xl">{action.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{action.label}</h3>
                <p className="text-sm text-slate-600">{action.desc}</p>
              </div>
              <span className="text-slate-400">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="pt-6 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full md:w-auto px-8 py-3 rounded-lg bg-slate-900 text-white font-medium hover:bg-black transition-colors"
        >
          登出账户
        </button>
      </div>
    </div>
  )
}
