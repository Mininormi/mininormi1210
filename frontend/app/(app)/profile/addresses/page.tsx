// app/(app)/profile/addresses/page.tsx
'use client'

import { useState } from 'react'

interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      name: '张三',
      phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: 'xxx街道xxx号',
      isDefault: true,
    },
    {
      id: 2,
      name: '李四',
      phone: '13900139000',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: 'yyy路yyy号',
      isDefault: false,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })))
  }

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个地址吗？')) {
      setAddresses(addresses.filter(addr => addr.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">收货地址</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black transition-colors"
        >
          {showAddForm ? '取消' : '+ 添加新地址'}
        </button>
      </div>

      {/* 添加地址表单 */}
      {showAddForm && (
        <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">添加新地址</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">收货人</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="请输入收货人姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系电话</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="请输入联系电话"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">省市区</label>
              <div className="grid grid-cols-3 gap-4">
                <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>请选择省份</option>
                </select>
                <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>请选择城市</option>
                </select>
                <select className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option>请选择区县</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">详细地址</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="请输入详细地址"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-sm text-slate-700">设为默认地址</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black transition-colors">
                保存
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 地址列表 */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📍</div>
          <p className="text-slate-600 mb-4">暂无收货地址</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border rounded-lg p-6 ${
                address.isDefault
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-slate-900">{address.name}</span>
                    <span className="text-slate-600">{address.phone}</span>
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs font-medium bg-slate-900 text-white rounded">
                        默认
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {address.province} {address.city} {address.district} {address.detail}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    设为默认
                  </button>
                )}
                <button className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
