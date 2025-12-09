// \components\NewArrivalsTabs.tsx

'use client'

import { useState } from 'react'
import NewArrivalsSplide from './NewArrivalsSplide'

type TabKey = 'new' | 'brands'

const placeholderBrands = Array.from({ length: 15 }, (_, i) => `Brand ${i + 1}`)

export default function NewArrivalsTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>('new')

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
        <div className="tab-fade-in-up mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-10 gap-y-8">
          {placeholderBrands.map((name) => (
            <div
              key={name}
              className="flex h-24 items-center justify-center rounded-md border border-slate-100 bg-slate-50 text-sm font-medium text-slate-500"
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
