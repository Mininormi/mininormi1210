// app/(app)/profile/tickets/page.tsx
'use client'

import { useState } from 'react'

type TicketStatus = 'open' | 'processing' | 'closed' | 'all'

export default function TicketsPage() {
  const [activeTab, setActiveTab] = useState<TicketStatus>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // 模拟工单数据（后续替换为 API）
  const tickets = [
    {
      id: 'TKT-20250101-001',
      title: '商品质量问题咨询',
      status: 'open',
      category: '商品咨询',
      createTime: '2025-01-01 10:30:00',
      lastReplyTime: '2025-01-01 10:30:00',
      unreadCount: 1,
    },
    {
      id: 'TKT-20250102-002',
      title: '订单配送问题',
      status: 'processing',
      category: '订单问题',
      createTime: '2025-01-02 14:20:00',
      lastReplyTime: '2025-01-02 15:30:00',
      unreadCount: 0,
    },
    {
      id: 'TKT-20241230-003',
      title: '退款申请',
      status: 'closed',
      category: '退款问题',
      createTime: '2024-12-30 09:15:00',
      lastReplyTime: '2024-12-30 16:45:00',
      unreadCount: 0,
    },
  ]

  const tabs = [
    { key: 'all' as TicketStatus, label: '全部工单' },
    { key: 'open' as TicketStatus, label: '待处理' },
    { key: 'processing' as TicketStatus, label: '处理中' },
    { key: 'closed' as TicketStatus, label: '已关闭' },
  ]

  const filteredTickets = activeTab === 'all'
    ? tickets
    : tickets.filter(ticket => ticket.status === activeTab)

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      open: { label: '待处理', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: '处理中', color: 'bg-blue-100 text-blue-800' },
      closed: { label: '已关闭', color: 'bg-slate-100 text-slate-800' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800' }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">服务工单</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black transition-colors"
        >
          {showCreateForm ? '取消' : '+ 创建工单'}
        </button>
      </div>

      {/* 创建工单表单 */}
      {showCreateForm && (
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">创建工单</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">问题分类</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
                <option>请选择问题分类</option>
                <option>商品咨询</option>
                <option>订单问题</option>
                <option>退款问题</option>
                <option>配送问题</option>
                <option>其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">问题标题</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="请简要描述问题"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">问题描述</label>
              <textarea
                rows={5}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="请详细描述您遇到的问题..."
              />
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black transition-colors">
                提交工单
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* 工单列表 */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🎫</div>
          <p className="text-slate-600">暂无工单</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const statusInfo = getStatusLabel(ticket.status)
            return (
              <div
                key={ticket.id}
                className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="font-medium text-slate-900">{ticket.title}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {ticket.unreadCount > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {ticket.unreadCount} 条未读
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      工单号：{ticket.id}
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      分类：{ticket.category}
                    </div>
                    <div className="text-sm text-slate-600">
                      创建时间：{ticket.createTime}
                    </div>
                    {ticket.lastReplyTime !== ticket.createTime && (
                      <div className="text-sm text-slate-600">
                        最后回复：{ticket.lastReplyTime}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                      查看详情
                    </button>
                    {ticket.status !== 'closed' && (
                      <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                        关闭工单
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
