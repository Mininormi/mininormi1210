// app/(app)/profile/refunds/page.tsx
'use client'

import { useState } from 'react'

type RefundStatus = 'pending' | 'processing' | 'completed' | 'rejected' | 'all'

export default function RefundsPage() {
  const [activeTab, setActiveTab] = useState<RefundStatus>('all')

  // 模拟退款数据（后续替换为 API）
  const refunds = [
    {
      id: 'REF-20250101-001',
      orderId: 'ORD-20250101-001',
      status: 'pending',
      reason: '商品质量问题',
      amount: 1299.00,
      applyTime: '2025-01-01 14:30:00',
      items: [{ name: '轮毂 A', quantity: 2 }],
    },
    {
      id: 'REF-20250102-002',
      orderId: 'ORD-20250102-002',
      status: 'processing',
      reason: '不想要了',
      amount: 899.00,
      applyTime: '2025-01-02 10:20:00',
      items: [{ name: '轮毂 B', quantity: 1 }],
    },
    {
      id: 'REF-20241230-003',
      orderId: 'ORD-20241230-003',
      status: 'completed',
      reason: '商品损坏',
      amount: 1599.00,
      applyTime: '2024-12-30 16:45:00',
      completedTime: '2025-01-01 09:00:00',
      items: [{ name: '轮毂 C', quantity: 1 }],
    },
  ]

  const tabs = [
    { key: 'all' as RefundStatus, label: '全部' },
    { key: 'pending' as RefundStatus, label: '待处理' },
    { key: 'processing' as RefundStatus, label: '处理中' },
    { key: 'completed' as RefundStatus, label: '已完成' },
    { key: 'rejected' as RefundStatus, label: '已拒绝' },
  ]

  const filteredRefunds = activeTab === 'all'
    ? refunds
    : refunds.filter(refund => refund.status === activeTab)

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
      rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">售后与退款</h2>

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

        {/* 退款列表 */}
        {filteredRefunds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">↩️</div>
            <p className="text-slate-600">暂无退款记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRefunds.map((refund) => {
              const statusInfo = getStatusLabel(refund.status)
              return (
                <div
                  key={refund.id}
                  className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="font-medium text-slate-900">退款单号：{refund.id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        关联订单：{refund.orderId}
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        申请时间：{refund.applyTime}
                      </div>
                      {refund.completedTime && (
                        <div className="text-sm text-slate-600 mb-2">
                          完成时间：{refund.completedTime}
                        </div>
                      )}
                      <div className="text-sm text-slate-700 mb-2">
                        退款原因：{refund.reason}
                      </div>
                      <div className="space-y-1">
                        {refund.items.map((item, idx) => (
                          <div key={idx} className="text-sm text-slate-700">
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                      <div className="text-lg font-semibold text-slate-900">
                        退款金额：¥{refund.amount.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                          查看详情
                        </button>
                        {refund.status === 'pending' && (
                          <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                            取消申请
                          </button>
                        )}
                      </div>
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
