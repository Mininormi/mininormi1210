// app/(app)/gallery/detail/[slug]/page.tsx

'use client'

import { useState, use } from 'react'
import Link from 'next/link'

export default function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // 使用 React.use() 解包 Promise
  const { slug } = use(params)
  
  // Mock 数据 - 后续接入真实 API
  const galleryItem = {
    id: slug,
    vehicle: {
      make: 'Alfa Romeo',
      model: 'Stelvio QV',
      year: '2023',
      variant: '949',
    },
    wheel: {
      brand: 'BBS',
      name: 'CI-R UNLIMITED',
      finish: 'Platinum Silver',
    },
    fitment: {
      front: '9.5×21 ET22',
      rear: '9.5×21 ET22',
    },
    unlimitedStyle: {
      centerCap: '3D Center Cap Chrome Logo grey/white',
      valveCaps: 'Silver',
      rimProtector: 'Stainless Steel',
      wheelBolts: 'Silver',
    },
    additionalInfo: {
      tireSizeFront: '265/40 R21 Continental SportContact 5P',
      tireSizeRear: '265/40 R21 Continental SportContact 5P',
      suspension: 'KW Adjustable Lowering Springs',
      wheelInstallation: 'KW automotive',
      developmentPartner: '-',
    },
    images: [
      { id: 1, alt: 'Main view' },
      { id: 2, alt: 'Side profile' },
      { id: 3, alt: 'Rear wheel detail' },
      { id: 4, alt: 'Wheel close-up' },
      { id: 5, alt: 'Wheel detail' },
    ],
  }

  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-8">
        {/* 面包屑 */}
        <div className="mb-6 flex items-center text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700">
            Home
          </Link>
          <span className="mx-2 text-slate-400">›</span>
          <Link href="/gallery" className="hover:text-slate-700">
            Gallery
          </Link>
          <span className="mx-2 text-slate-400">›</span>
          <span className="text-slate-900 font-medium line-clamp-1">
            {galleryItem.vehicle.make} {galleryItem.vehicle.model}
          </span>
        </div>

        {/* 顶部主区域 */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)]">
          {/* 左侧图片区域 */}
          <div className="space-y-4">
            {/* 主图 */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
                {/* 这里将来替换成真实图片 */}
                <div className="flex h-full items-center justify-center text-slate-400">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
                      Placeholder Image {selectedImage + 1}
                    </p>
                    <p className="text-sm text-slate-600">
                      {galleryItem.images[selectedImage]?.alt || 'Main view'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 缩略图 */}
            <div className="grid grid-cols-5 gap-3">
              {galleryItem.images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === index
                      ? 'border-slate-900 shadow-md'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="h-full w-full bg-slate-800/90">
                    {/* 缩略图占位 */}
                    <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                      {index + 1}
                    </div>
                  </div>
                  {selectedImage === index && (
                    <div className="absolute inset-0 bg-slate-900/10" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 右侧信息区域 */}
          <div className="space-y-6">
            {/* 标题区域 */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                    {galleryItem.wheel.brand} {galleryItem.wheel.name}
                  </h1>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {galleryItem.vehicle.make} {galleryItem.vehicle.model} {galleryItem.vehicle.variant}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                    UNLIMITED
                  </span>
                </div>
              </div>
            </div>

            {/* 轮毂规格卡片 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Wheel Specification
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Front Fitment</dt>
                  <dd className="font-semibold text-slate-900">{galleryItem.fitment.front}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Rear Fitment</dt>
                  <dd className="font-semibold text-slate-900">{galleryItem.fitment.rear}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-600">Finish</dt>
                  <dd className="font-semibold text-slate-900">{galleryItem.wheel.finish}</dd>
                </div>
              </dl>
            </div>

            {/* Unlimited Style 卡片 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Unlimited Style
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Center Cap</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {galleryItem.unlimitedStyle.centerCap}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Valve Caps</dt>
                  <dd className="font-medium text-slate-900">{galleryItem.unlimitedStyle.valveCaps}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Rim Protector</dt>
                  <dd className="font-medium text-slate-900">
                    {galleryItem.unlimitedStyle.rimProtector}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-600">Wheel Bolts</dt>
                  <dd className="font-medium text-slate-900">{galleryItem.unlimitedStyle.wheelBolts}</dd>
                </div>
              </dl>
            </div>

            {/* 更多信息卡片 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Further Information
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Tire Size Front</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {galleryItem.additionalInfo.tireSizeFront}
                  </dd>
                </div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Tire Size Rear</dt>
                  <dd className="text-right font-medium text-slate-900">
                    {galleryItem.additionalInfo.tireSizeRear}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Suspension</dt>
                  <dd className="font-medium text-slate-900">
                    {galleryItem.additionalInfo.suspension}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <dt className="font-medium text-slate-600">Wheel Installation</dt>
                  <dd className="font-medium text-slate-900">
                    {galleryItem.additionalInfo.wheelInstallation}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-600">Development Partner</dt>
                  <dd className="font-medium text-slate-900">
                    {galleryItem.additionalInfo.developmentPartner || '-'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* CTA 按钮 */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border-2 border-slate-900 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                CONTACT
              </Link>
              <Link
                href="/shop/all"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/30 transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                TO SHOP
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

