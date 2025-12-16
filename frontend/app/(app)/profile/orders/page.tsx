// app/(app)/profile/orders/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

type OrderStatus = 'pending' | 'shipped' | 'completed' | 'all'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('all')

  // 模拟订单数据（后续替换为 API）
  const orders = [
    {
      id: 'ORD-20250101-001',
      status: 'pending',
      date: '2025-01-01',
      total: 1299.00,
      items: [{ name: '轮毂 A', quantity: 2, price: 649.50 }],
    },
    {
      id: 'ORD-20250102-002',
      status: 'shipped',
      date: '2025-01-02',
      total: 899.00,
      items: [{ name: '轮毂 B', quantity: 1, price: 899.00 }],
    },
    {
      id: 'ORD-20241230-003',
      status: 'completed',
      date: '2024-12-30',
      total: 1599.00,
      items: [{ name: '轮毂 C', quantity: 1, price: 1599.00 }],
    },
  ]

  const tabs = [
    { key: 'all' as OrderStatus, label: '全部订单' },
    { key: 'pending' as OrderStatus, label: '待发货' },
    { key: 'shipped' as OrderStatus, label: '已发货' },
    { key: 'completed' as OrderStatus, label: '已完成' },
  ]

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab)

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: '待发货', color: 'bg-yellow-100 text-yellow-800' },
      shipped: { label: '已发货', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">我的订单</h2>
        
        {/* 标签页 */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
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

        {/* 订单列表 */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-slate-600">暂无订单</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusLabel(order.status)
              return (
                <div
                  key={order.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="font-medium text-slate-900">订单号：{order.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        下单时间：{order.date}
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-slate-700">
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                      <div className="text-lg font-semibold text-slate-900">
                        ¥{order.total.toFixed(2)}
                      </div>
                      <Link
                        href={`/profile/orders/${order.id}`}
                        className="px-4 py-2 text-sm font-medium text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        查看详情
                      </Link>
                    </div>
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
