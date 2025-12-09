// app/(app)/gallery/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GalleryPage() {
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedWheel, setSelectedWheel] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // 模拟数据：每页6个图片（2列 x 3行）
  const itemsPerPage = 6
  const totalItems = 24 // 假设总共24个图片
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // 生成当前页的占位图数据
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return Array.from({ length: itemsPerPage }, (_, i) => startIndex + i + 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 当筛选条件改变时，重置到第一页
  const handleBrandChange = (value: string) => {
    setSelectedBrand(value)
    setSelectedModel('') // 切换品牌时重置车型
    setCurrentPage(1)
  }

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
    setCurrentPage(1)
  }

  const handleWheelChange = (value: string) => {
    setSelectedWheel(value)
    setCurrentPage(1)
  }

  // 根据品牌获取对应的车型选项
  const getModelOptions = () => {
    const modelMap: Record<string, string[]> = {
      honda: ['Civic', 'Accord', 'CR-V', 'Pilot', 'Ridgeline'],
      mazda: ['MX-5', 'CX-5', 'CX-9', 'Mazda3', 'Mazda6'],
      subaru: ['WRX', 'STI', 'BRZ', 'Forester', 'Outback'],
      toyota: ['Corolla', 'Camry', 'RAV4', 'Supra', '86'],
      nissan: ['GT-R', '370Z', 'Altima', 'Sentra', 'Rogue'],
      bmw: ['3 Series', '5 Series', 'M3', 'M4', 'X3'],
      mercedes: ['C-Class', 'E-Class', 'S-Class', 'AMG GT', 'GLC'],
    }
    return modelMap[selectedBrand] || []
  }

  return (
    <div className="bg-slate-50">
      {/* 筛选区域 */}
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-lg font-semibold text-slate-900">Gallery</h2>
            <p className="mt-1 text-xs text-slate-600 md:text-sm">
              浏览我们的轮毂画廊，按品牌、车型和轮毂类型筛选您喜欢的款式。
            </p>
          </div>

          <div className="px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-4 md:grid-cols-3">
              {/* 品牌筛选 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  筛选品牌
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">全部品牌</option>
                  <option value="honda">Honda</option>
                  <option value="mazda">Mazda</option>
                  <option value="subaru">Subaru</option>
                  <option value="toyota">Toyota</option>
                  <option value="nissan">Nissan</option>
                  <option value="bmw">BMW</option>
                  <option value="mercedes">Mercedes-Benz</option>
                </select>
              </div>

              {/* 车型筛选 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  筛选车型
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => handleModelChange(e.target.value)}
                  disabled={!selectedBrand}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {selectedBrand ? '选择车型…' : '请先选择品牌'}
                  </option>
                  {getModelOptions().map((model) => (
                    <option key={model} value={model.toLowerCase()}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* 轮毂筛选 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  筛选轮毂
                </label>
                <select
                  value={selectedWheel}
                  onChange={(e) => handleWheelChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">全部轮毂</option>
                  <option value="weds">Weds</option>
                  <option value="enkei">Enkei</option>
                  <option value="rays">Rays</option>
                  <option value="work">Work</option>
                  <option value="ssr">SSR</option>
                  <option value="volk">Volk Racing</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 图片画廊区域 */}
      <section className="mx-auto max-w-6xl px-4 pb-10 md:pb-12">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {getCurrentPageItems().map((item) => (
            <Link
              key={item}
              href={`/gallery/detail/gallery-item-${item}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 shadow-sm transition-all hover:border-slate-400 hover:shadow-md"
            >
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <span className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Placeholder · Gallery {item}
                </span>
                <p className="text-sm text-slate-500">
                  轮毂图片
                  <br />
                  {selectedBrand && `品牌: ${selectedBrand}`}
                  {selectedModel && `车型: ${selectedModel}`}
                  {selectedWheel && `轮毂: ${selectedWheel}`}
                </p>
              </div>
              {/* 悬停效果 */}
              <div className="absolute inset-0 bg-slate-900/0 transition-colors group-hover:bg-slate-900/5" />
            </Link>
          ))}
        </div>
      </section>

      {/* 分页组件 */}
      <section className="mx-auto max-w-6xl px-4 pb-10 md:pb-12">
        <div className="flex items-center justify-center gap-2">
          {/* 上一页按钮 */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            上一页
          </button>

          {/* 页码按钮 */}
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // 显示逻辑：当前页前后各2页，以及首尾页
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 2 && page <= currentPage + 2)

              if (!showPage) {
                // 显示省略号
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return (
                    <span
                      key={page}
                      className="px-3 py-2 text-sm font-medium text-slate-500"
                    >
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                    currentPage === page
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          {/* 下一页按钮 */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            下一页
          </button>
        </div>

        {/* 分页信息 */}
        <div className="mt-4 text-center text-xs text-slate-500">
          显示第 {(currentPage - 1) * itemsPerPage + 1} -{' '}
          {Math.min(currentPage * itemsPerPage, totalItems)} 项，共 {totalItems} 项
        </div>
      </section>
    </div>
  )
}

