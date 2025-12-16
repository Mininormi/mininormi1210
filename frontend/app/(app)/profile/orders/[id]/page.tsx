// app/(app)/profile/orders/[id]/page.tsx
'use client'

import { use } from 'react'
import Link from 'next/link'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // 模拟订单详情数据（后续替换为 API）
  const order = {
    id,
    status: 'pending',
    date: '2025-01-01 10:30:00',
    total: 1299.00,
    shippingFee: 0,
    discount: 0,
    items: [
      { id: 1, name: '轮毂 A', quantity: 2, price: 649.50, image: '/placeholder-wheel.jpg' },
    ],
    shippingAddress: {
      name: '张三',
      phone: '13800138000',
      address: '北京市朝阳区xxx街道xxx号',
    },
    paymentMethod: '在线支付',
    paymentTime: '2025-01-01 10:35:00',
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; desc: string }> = {
      pending: { label: '待发货', color: 'bg-yellow-100 text-yellow-800', desc: '订单已确认，等待发货' },
      shipped: { label: '已发货', color: 'bg-blue-100 text-blue-800', desc: '商品已发出，请注意查收' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-800', desc: '订单已完成' },
    }
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-800', desc: '' }
  }

  const statusInfo = getStatusLabel(order.status)

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link
        href="/profile/orders"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        ← 返回订单列表
      </Link>

      {/* 订单状态 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">订单详情</h2>
          <p className="text-sm text-slate-600">订单号：{order.id}</p>
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* 订单信息卡片 */}
      <div className="space-y-6">
        {/* 商品信息 */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">商品信息</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-20 h-20 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-2xl">🛞</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">{item.name}</h4>
                  <div className="text-sm text-slate-600">
                    数量：{item.quantity} × ¥{item.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">
                    ¥{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 收货信息 */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">收货信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-slate-600">收货人：</span>
              <span className="text-slate-900">{order.shippingAddress.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-600">联系电话：</span>
              <span className="text-slate-900">{order.shippingAddress.phone}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-600">收货地址：</span>
              <span className="text-slate-900">{order.shippingAddress.address}</span>
            </div>
          </div>
        </div>

        {/* 支付信息 */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">支付信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">支付方式：</span>
              <span className="text-slate-900">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">支付时间：</span>
              <span className="text-slate-900">{order.paymentTime}</span>
            </div>
          </div>
        </div>

        {/* 费用明细 */}
        <div className="border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">费用明细</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">商品总额</span>
              <span className="text-slate-900">¥{(order.total - order.shippingFee + order.discount).toFixed(2)}</span>
            </div>
            {order.shippingFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">运费</span>
                <span className="text-slate-900">¥{order.shippingFee.toFixed(2)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">优惠</span>
                <span className="text-green-600">-¥{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-slate-200">
              <span className="text-base font-semibold text-slate-900">实付金额</span>
              <span className="text-xl font-bold text-slate-900">¥{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
