// \components\NewArrivalsTabs.tsx

'use client'

import { useState, useEffect } from 'react'
import NewArrivalsSplide from './NewArrivalsSplide'
import { getBrands, type Brand } from '@/lib/api/shop'
import Image from 'next/image'

type TabKey = 'new' | 'brands'

export default function NewArrivalsTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('new')
  const [brands, setBrands] = useState<Brand[]>([])
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [brandsError, setBrandsError] = useState<string | null>(null)

  // 加载品牌列表
  useEffect(() => {
    if (activeTab === 'brands' && brands.length === 0 && !brandsLoading) {
      setBrandsLoading(true)
      setBrandsError(null)
      getBrands()
        .then((response) => {
          setBrands(response.brands)
        })
        .catch((error) => {
          console.error('Failed to load brands:', error)
          setBrandsError(error.detail || '加载品牌列表失败')
        })
        .finally(() => {
          setBrandsLoading(false)
        })
    }
  }, [activeTab, brands.length, brandsLoading])

  return (
    <section className="mt-16 space-y-8">
      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`pb-3 border-b-2 transition-colors
              ${
                activeTab === 'new'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            New Arrivals
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('brands')}
            className={`pb-3 border-b-2 transition-colors
              ${
                activeTab === 'brands'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
          >
            Featured Brands
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'new' && (
        <div className="tab-fade-in-up">
          <NewArrivalsSplide />
        </div>
      )}

      {activeTab === 'brands' && (
        <div className="tab-fade-in-up mt-4">
          {brandsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-24 items-center justify-center rounded-md border border-slate-100 bg-slate-50 animate-pulse"
                >
                  <div className="h-12 w-12 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : brandsError ? (
            <div className="text-center py-8 text-slate-500">
              <p>{brandsError}</p>
              <button
                onClick={() => {
                  setBrands([])
                  setBrandsError(null)
                }}
                className="mt-4 text-sm text-slate-600 hover:text-slate-900 underline"
              >
                重试
              </button>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              暂无品牌数据
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-8">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex h-24 items-center justify-center rounded-md border border-slate-100 bg-white hover:border-slate-300 transition-colors overflow-hidden"
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={180}
                      height={64}
                      className="object-contain max-h-full max-w-full p-2"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-medium text-slate-500 px-4">
                      {brand.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
