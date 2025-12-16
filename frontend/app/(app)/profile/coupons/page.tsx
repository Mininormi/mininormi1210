// app/(app)/profile/coupons/page.tsx
'use client'

import { useState } from 'react'

type CouponStatus = 'available' | 'used' | 'expired' | 'all'

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<CouponStatus>('available')

  // 模拟优惠券数据（后续替换为 API）
  const coupons = [
    {
      id: 1,
      name: '新用户专享',
      type: 'discount', // discount: 折扣, amount: 满减
      value: 100,
      minAmount: 500,
      expireTime: '2025-12-31',
      status: 'available',
      description: '新用户专享优惠券',
    },
    {
      id: 2,
      name: '满减优惠',
      type: 'amount',
      value: 50,
      minAmount: 300,
      expireTime: '2025-06-30',
      status: 'available',
      description: '满300减50',
    },
    {
      id: 3,
      name: '折扣优惠',
      type: 'discount',
      value: 0.9,
      minAmount: 200,
      expireTime: '2025-03-31',
      status: 'available',
      description: '9折优惠',
    },
    {
      id: 4,
      name: '已使用优惠券',
      type: 'amount',
      value: 30,
      minAmount: 200,
      expireTime: '2024-12-31',
      status: 'used',
      usedTime: '2024-12-15',
    },
    {
      id: 5,
      name: '已过期优惠券',
      type: 'discount',
      value: 0.85,
      minAmount: 100,
      expireTime: '2024-12-31',
      status: 'expired',
    },
  ]

  const tabs = [
    { key: 'all' as CouponStatus, label: '全部' },
    { key: 'available' as CouponStatus, label: '可使用' },
    { key: 'used' as CouponStatus, label: '已使用' },
    { key: 'expired' as CouponStatus, label: '已过期' },
  ]

  const filteredCoupons = activeTab === 'all'
    ? coupons
    : coupons.filter(coupon => coupon.status === activeTab)

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      available: { label: '可使用', color: 'bg-green-100 text-green-800' },
      used: { label: '已使用', color: 'bg-slate-100 text-slate-800' },
      expired: { label: '已过期', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  const formatCouponValue = (coupon: typeof coupons[0]) => {
    if (coupon.type === 'discount') {
      return `${(coupon.value * 10).toFixed(0)}折`
    } else {
      return `¥${coupon.value}`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">我的优惠</h2>

        {/* 标签页 */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap
                ${
                  activeTab === tab.key
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 优惠券列表 */}
        {filteredCoupons.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎁</div>
            <p className="text-slate-600">暂无优惠券</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCoupons.map((coupon) => {
              const statusInfo = getStatusLabel(coupon.status)
              const isDisabled = coupon.status !== 'available'

              return (
                <div
                  key={coupon.id}
                  className={`
                    border rounded-lg p-6 relative overflow-hidden
                    ${
                      isDisabled
                        ? 'border-slate-200 bg-slate-50 opacity-60'
                        : 'border-slate-300 bg-gradient-to-br from-slate-50 to-white'
                    }
                  `}
                >
                  {/* 优惠券装饰 */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-slate-200 rounded-full -mr-10 -mt-10 opacity-20" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-200 rounded-full -ml-8 -mb-8 opacity-20" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {coupon.name}
                        </h3>
                        {coupon.description && (
                          <p className="text-sm text-slate-600">{coupon.description}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {formatCouponValue(coupon)}
                      </div>
                      {coupon.type === 'amount' && (
                        <div className="text-sm text-slate-600">
                          满¥{coupon.minAmount}可用
                        </div>
                      )}
                      {coupon.type === 'discount' && (
                        <div className="text-sm text-slate-600">
                          满¥{coupon.minAmount}可用
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 mb-4">
                      有效期至：{coupon.expireTime}
                    </div>

                    {coupon.status === 'used' && coupon.usedTime && (
                      <div className="text-xs text-slate-600 mb-4">
                        使用时间：{coupon.usedTime}
                      </div>
                    )}

                    {coupon.status === 'available' && (
                      <button className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black transition-colors">
                        去使用
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
