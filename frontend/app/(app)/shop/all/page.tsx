'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getWheelsByVehicle, type WheelProduct } from '@/lib/api/shop'
import { getFitment, type Fitment } from '@/lib/api/vehicles'

function AllWheelsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const vehicleId = searchParams.get('vehicle_id')
  const diameterParam = searchParams.get('diameter')
  const selectedDiameter = diameterParam ? parseInt(diameterParam, 10) : null
  
  const [fitment, setFitment] = useState<Fitment | null>(null)
  const [wheels, setWheels] = useState<WheelProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [fitmentLoading, setFitmentLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  // 加载 fitment 信息
  useEffect(() => {
    if (!vehicleId) {
      setFitment(null)
      setFitmentLoading(false)
      return
    }

    const loadFitment = async () => {
      setFitmentLoading(true)
      try {
        const data = await getFitment(vehicleId)
        setFitment(data)
      } catch (error) {
        console.error('Failed to load fitment:', error)
        setFitment(null)
      } finally {
        setFitmentLoading(false)
      }
    }
    loadFitment()
  }, [vehicleId])

  // 加载商品列表
  useEffect(() => {
    const loadWheels = async () => {
      setLoading(true)
      try {
        // 必须提供 vehicle_id 才能查询
        if (!vehicleId) {
          setWheels([])
          setTotal(0)
          setLoading(false)
          return
        }
        
        const response = await getWheelsByVehicle({
          vehicle_id: vehicleId,
          axle: 'both', // 前后轮都匹配
          diameter: selectedDiameter || undefined,
          page,
          page_size: pageSize,
        })
        
        setWheels(response.items)
        setTotal(response.total)
      } catch (error) {
        console.error('Failed to load wheels:', error)
        setWheels([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
    loadWheels()
  }, [vehicleId, selectedDiameter, page])

  // 处理尺寸按钮点击
  const handleSizeClick = (diameter: number | null) => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (diameter === null) {
      newParams.delete('diameter')
    } else {
      newParams.set('diameter', diameter.toString())
    }
    router.push(`/shop/all?${newParams.toString()}`)
    setPage(1) // 重置到第一页
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-6">
      <div className="mb-6 flex items-center text-sm text-slate-500">
        <a href="/" className="hover:text-slate-700">
          Home
        </a>
        <span className="mx-2 text-slate-400">›</span>
        <span className="text-slate-900 font-medium">All Wheels</span>
      </div>

      <div className="space-y-6">
        {/* Vehicle Fitment Info（如果有 vehicle_id） */}
        {vehicleId && (
          <>
            {/* OEM Info 表格 */}
            {fitmentLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Loading fitment info...
              </div>
            ) : fitment ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm text-white">
                🚗
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  OEM Info
                </p>
                <p className="text-sm font-semibold text-slate-900">
                      {fitment.vehicle_name || fitment.vehicle_id}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto px-5 py-4">
              <table className="min-w-full text-left text-xs text-slate-700">
                <thead className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">OEM Wheels</th>
                    <th className="py-2 pr-4">Bolt Pattern</th>
                    <th className="py-2 pr-4">OEM Offset</th>
                    <th className="py-2 pr-4">Wheel Size</th>
                        <th className="py-2 pr-4">Hub Bore</th>
                    <th className="py-2 pr-4">Tire Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                      {fitment.oem_front && (
                  <tr>
                    <td className="py-2 pr-4 font-medium text-slate-900">Front</td>
                          <td className="py-2 pr-4">{fitment.oem_front.bolt_pattern || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_front.offset_oem || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_front.wheel_size || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_front.hub_bore || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_front.tire_size || '-'}</td>
                  </tr>
                      )}
                      {fitment.oem_rear && (
                  <tr>
                    <td className="py-2 pr-4 font-medium text-slate-900">Rear</td>
                          <td className="py-2 pr-4">{fitment.oem_rear.bolt_pattern || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_rear.offset_oem || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_rear.wheel_size || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_rear.hub_bore || '-'}</td>
                          <td className="py-2 pr-4">{fitment.oem_rear.tire_size || '-'}</td>
                        </tr>
                      )}
                      {!fitment.oem_rear && fitment.oem_front && (
                        <tr>
                          <td colSpan={6} className="py-2 pr-4 text-center text-slate-500">
                            Non-staggered setup
                          </td>
                  </tr>
                      )}
                </tbody>
              </table>
            </div>
          </div>
            ) : null}

            {/* Available Sizes */}
            {fitment && fitment.available_sizes.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Available Sizes
                </p>
                <p className="mt-1 text-xs text-slate-600">
                      Upsize / downsize around the OEM package.
                </p>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2">
                    {fitment.available_sizes.map((size, index) => {
                      const isSelected = size.diameter === selectedDiameter || 
                        (size.diameter === null && selectedDiameter === null)
                      return (
                <button
                          key={index}
                  type="button"
                          onClick={() => handleSizeClick(size.diameter)}
                          className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium transition ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30'
                              : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-900'
                          }`}
                >
                          {size.label}
                </button>
                      )
                    })}
              </div>
            </div>
          </div>
            )}
          </>
        )}

        {/* 商品列表 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                All Wheels ·{' '}
                <span className="font-normal text-slate-500">
                {loading ? 'Loading...' : `Showing ${wheels.length} of ${total}+`}
                </span>
              </p>
            </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : wheels.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-500">No wheels found</p>
              {!vehicleId && (
                <p className="mt-2 text-sm text-slate-400">
                  Try selecting a vehicle from{' '}
                  <Link href="/shop/by-vehicle" className="text-slate-900 underline">
                    By Vehicle
                  </Link>
                </p>
              )}
            </div>
          ) : (
            <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {wheels.map((wheel) => (
                <article
                    key={wheel.product_id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                    <Link href={`/shop/product/${wheel.product_id}`} className="block">
                      <div className="aspect-square w-full bg-slate-100">
                        {wheel.image && (
                          <img
                            src={wheel.image}
                            alt={wheel.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                  </Link>

                  <div className="flex flex-1 flex-col gap-3 px-4 py-3">
                      <div className="flex min-h-20 flex-col justify-between">
                      <div className="flex items-center justify-between gap-3 h-10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {wheel.brand_name || 'Unknown Brand'}
                          </p>
                      </div>
                      <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-900 line-clamp-3">
                        {wheel.name}
                      </h3>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                          {wheel.sale_price && (
                        <span className="text-sm font-semibold text-slate-900">
                              ${wheel.sale_price} CAD
                        </span>
                          )}
                          {wheel.original_price && wheel.original_price > (wheel.sale_price || 0) && (
                        <span className="text-xs text-slate-400 line-through">
                              ${wheel.original_price}
                        </span>
                          )}
                      </div>
                        {wheel.price_per && (
                          <p className="mt-1 text-[11px] text-slate-500">{wheel.price_per}</p>
                        )}
                    </div>

                      {wheel.specs.length > 0 && (
                        <div className="mt-1 text-[11px] text-slate-500">
                          {wheel.specs.length} specification{wheel.specs.length > 1 ? 's' : ''} available
                      </div>
                      )}

                    <div className="mt-auto flex items-center justify-end pt-2">
                        <Link
                          href={`/shop/product/${wheel.product_id}`}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
                      >
                        Details & Preview
                        </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 分页 */}
              {total > pageSize && (
            <nav className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600">
              <button
                type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === Math.ceil(total / pageSize) || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <div key={p} className="flex items-center gap-1">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="px-1 text-[11px] text-slate-400">…</span>
                          )}
                <button
                  type="button"
                            onClick={() => setPage(p)}
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${
                              p === page
                                ? 'bg-slate-900 font-semibold text-white'
                                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-900'
                            }`}
                >
                            {p}
                </button>
                        </div>
                      ))}
              </div>
              <button
                type="button"
                    onClick={() => setPage((p) => Math.min(Math.ceil(total / pageSize), p + 1))}
                    disabled={page >= Math.ceil(total / pageSize)}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function AllWheelsPage() {
  return (
    <Suspense fallback={
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-6">
        <div className="text-center text-slate-500">Loading...</div>
      </section>
    }>
      <AllWheelsContent />
    </Suspense>
  )
}
