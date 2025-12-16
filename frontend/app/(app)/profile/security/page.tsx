// app/(app)/profile/security/page.tsx
'use client'

import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'

export default function SecurityPage() {
  const { user } = useAuth()

  const securityItems = [
    {
      title: '登录密码',
      desc: '定期更换密码可以让账户更安全',
      action: '修改密码',
      href: '/profile/security/change-password',
      icon: '🔑',
    },
    {
      title: '邮箱验证',
      desc: user?.email || '未绑定',
      action: user?.email ? '更换邮箱' : '绑定邮箱',
      href: '/profile/security/change-email',
      icon: '📧',
    },
    {
      title: '手机验证',
      desc: user?.mobile || '未绑定',
      action: user?.mobile ? '更换手机' : '绑定手机',
      href: '/profile/security/change-mobile',
      icon: '📱',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">账户与安全</h2>

        <div className="space-y-4">
          {securityItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-6 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
              <Link
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {item.action}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 安全提示 */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">安全提示</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>请使用强密码，包含字母、数字和特殊字符</li>
          <li>不要将密码告诉他人或在不安全的环境下输入</li>
          <li>定期更换密码，建议每3个月更换一次</li>
          <li>绑定手机和邮箱，以便及时接收安全通知</li>
        </ul>
      </div>
    </div>
  )
}
