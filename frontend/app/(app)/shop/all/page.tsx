'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getWheelsByVehicle, type WheelProduct, type WidthFacetItem, type OffsetBucketItem } from '@/lib/api/shop'
import { getFitment, type Fitment } from '@/lib/api/vehicles'

// 筛选面板组件（draft state + Apply 模式）
function FiltersPanel({ 
  searchParams, 
  router, 
  onFilterChange,
  availableWidths,
  availableOffsetBuckets
}: { 
  searchParams: URLSearchParams
  router: ReturnType<typeof useRouter>
  onFilterChange: () => void
  availableWidths: WidthFacetItem[]
  availableOffsetBuckets: OffsetBucketItem[]
}) {
  // Draft state：用户修改的值（未应用）
  const [draftFilters, setDraftFilters] = useState<Record<string, string | null>>({})
  // Width 和 Offset 的单选值（UI 专用，Apply 时会映射回 min_width/max_width 等）
  const [selectedWidthValue, setSelectedWidthValue] = useState<string | null>(null)
  const [selectedOffsetBucket, setSelectedOffsetBucket] = useState<string | null>(null)
  
  // 初始化：从 URL（applied 值）填充 draft
  // 使用 searchParams.toString() 作为依赖，避免 searchParams 对象引用变化导致重复触发
  useEffect(() => {
    const applied: Record<string, string | null> = {}
    const filterKeys = [
      'min_price', 'max_price', 'tpms_compatible', 
      'center_cap_included', 'hub_ring_included', 'winter_approved'
    ]
    filterKeys.forEach(key => {
      applied[key] = searchParams.get(key)
    })
    setDraftFilters(applied)
    
    // 从 URL 的 min_width/max_width 推断选中的 width（如果相等，说明是单选）
    const minWidth = searchParams.get('min_width')
    const maxWidth = searchParams.get('max_width')
    if (minWidth && maxWidth && minWidth === maxWidth) {
      setSelectedWidthValue(minWidth)
    } else {
      setSelectedWidthValue(null)
    }
    
    // 从 URL 的 min_offset/max_offset 推断选中的 offset bucket
    const minOffset = searchParams.get('min_offset')
    const maxOffset = searchParams.get('max_offset')
    if (minOffset && maxOffset && availableOffsetBuckets.length > 0) {
      // 查找匹配的 bucket
      const matchedBucket = availableOffsetBuckets.find(
        (bucket: OffsetBucketItem) => bucket.min.toString() === minOffset && bucket.max.toString() === maxOffset
      )
      if (matchedBucket) {
        setSelectedOffsetBucket(`${matchedBucket.min}-${matchedBucket.max}`)
      } else {
        setSelectedOffsetBucket(null)
      }
    } else {
      setSelectedOffsetBucket(null)
    }
  }, [searchParams.toString(), availableOffsetBuckets]) // 使用 toString() 确保只有 URL 真正变化时才重置
  
  // 更新 draft（不写 URL，不触发请求）
  const updateDraftFilter = (key: string, value: string | null) => {
    setDraftFilters(prev => ({
      ...prev,
      [key]: value === '' ? null : value
    }))
  }
  
  // Apply 按钮：把 draft 写回 URL，触发请求
  const handleApplyFilters = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    // 保留 vehicle_id 和 diameter（这些不是筛选条件）
    const preserveKeys = ['vehicle_id', 'diameter']
    const tempParams = new URLSearchParams()
    preserveKeys.forEach(key => {
      const value = searchParams.get(key)
      if (value) tempParams.set(key, value)
    })
    
    // 添加 draft 筛选条件
    Object.entries(draftFilters).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        tempParams.set(key, value)
      }
    })
    
    router.push(`/shop/all?${tempParams.toString()}`, { scroll: false })
    onFilterChange() // 触发 setPage(1)
  }
  
  // Clear 按钮：清空 draft
  const handleClearFilters = () => {
    const cleared: Record<string, string | null> = {}
    const filterKeys = [
      'min_price', 'max_price', 'tpms_compatible', 
      'center_cap_included', 'hub_ring_included', 'winter_approved'
    ]
    filterKeys.forEach(key => {
      cleared[key] = null
    })
    setDraftFilters(cleared)
    setSelectedWidthValue(null)
    setSelectedOffsetBucket(null)
  }

  // 三态选择器组件（All / Yes / No）- 使用 draft state
  const TriStateSelector = ({ 
    label, 
    paramKey
  }: { 
    label: string
    paramKey: string
  }) => {
    const draftValue = draftFilters[paramKey] || null
    const states: Array<{ value: string | null; label: string }> = [
      { value: null, label: 'All' },
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ]
    
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <div className="flex gap-1">
          {states.map((state) => {
            const isActive = draftValue === state.value
            return (
              <button
                key={state.value || 'all'}
                type="button"
                onClick={() => updateDraftFilter(paramKey, state.value)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-900'
                }`}
              >
                {state.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // 范围输入组件 - 使用 draft state
  const RangeInput = ({ 
    label, 
    minKey, 
    maxKey, 
    minPlaceholder, 
    maxPlaceholder,
    step = 0.1
  }: { 
    label: string
    minKey: string
    maxKey: string
    minPlaceholder: string
    maxPlaceholder: string
    step?: number
  }) => {
    const minValue = draftFilters[minKey] || ''
    const maxValue = draftFilters[maxKey] || ''
    
    return (
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <input
            type="number"
            placeholder={minPlaceholder}
            value={minValue}
            onChange={(e) => updateDraftFilter(minKey, e.target.value || null)}
            step={step}
            className="min-w-0 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none"
          />
          <span className="text-xs text-slate-500 whitespace-nowrap">to</span>
          <input
            type="number"
            placeholder={maxPlaceholder}
            value={maxValue}
            onChange={(e) => updateDraftFilter(maxKey, e.target.value || null)}
            step={step}
            className="min-w-0 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-slate-900 focus:outline-none"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Filters
        </p>
      </div>
      <div className="px-5 py-4 space-y-6">
        {/* 价格范围 */}
        <RangeInput
          label="Price (CAD)"
          minKey="min_price"
          maxKey="max_price"
          minPlaceholder="Min"
          maxPlaceholder="Max"
          step={1}
        />

        {/* Width 单选列表 */}
        {availableWidths.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Width (inches)</label>
            <div className="space-y-1.5">
              {availableWidths.map((item) => {
                const isSelected = selectedWidthValue === item.value.toString()
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      // 如果已选中，再点一次取消选择；否则选中
                      setSelectedWidthValue(isSelected ? null : item.value.toString())
                    }}
                    className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-xs transition ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-900'
                    }`}
                  >
                    <span>{item.value}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      ({item.count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Offset 单选范围桶列表 */}
        {availableOffsetBuckets.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Offset / ET (mm)</label>
            <div className="space-y-1.5">
              {availableOffsetBuckets.map((bucket) => {
                const bucketKey = `${bucket.min}-${bucket.max}`
                const isSelected = selectedOffsetBucket === bucketKey
                return (
                  <button
                    key={bucketKey}
                    type="button"
                    onClick={() => {
                      // 如果已选中，再点一次取消选择；否则选中
                      setSelectedOffsetBucket(isSelected ? null : bucketKey)
                    }}
                    className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-xs transition ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-900'
                    }`}
                  >
                    <span>{bucket.label}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      ({bucket.count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* TPMS */}
        <TriStateSelector
          label="TPMS Compatible"
          paramKey="tpms_compatible"
        />

        {/* 中心盖 */}
        <TriStateSelector
          label="Center Cap Included"
          paramKey="center_cap_included"
        />

        {/* 中心环 */}
        <TriStateSelector
          label="Hub Ring Included"
          paramKey="hub_ring_included"
        />

        {/* 冬季认证 */}
        <TriStateSelector
          label="Winter Approved"
          paramKey="winter_approved"
        />

        {/* Apply 按钮 */}
        <button
          type="button"
          onClick={handleApplyFilters}
          className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
        >
          Apply Filters
        </button>

        {/* Clear 按钮 */}
        {(draftFilters.min_price || draftFilters.max_price || 
          draftFilters.min_width || draftFilters.max_width || 
          draftFilters.min_offset || draftFilters.max_offset || 
          draftFilters.tpms_compatible || draftFilters.center_cap_included || 
          draftFilters.hub_ring_included || draftFilters.winter_approved) && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-slate-900"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}

function AllWheelsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const vehicleId = searchParams.get('vehicle_id')
  const diameterParam = searchParams.get('diameter')
  // 筛选参数（从 URL 解析）
  const minPriceParam = searchParams.get('min_price')
  const maxPriceParam = searchParams.get('max_price')
  const minWidthParam = searchParams.get('min_width')
  const maxWidthParam = searchParams.get('max_width')
  const minOffsetParam = searchParams.get('min_offset')
  const maxOffsetParam = searchParams.get('max_offset')
  const tpmsParam = searchParams.get('tpms_compatible')
  const centerCapParam = searchParams.get('center_cap_included')
  const hubRingParam = searchParams.get('hub_ring_included')
  const winterApprovedParam = searchParams.get('winter_approved')
  
  // 如果 URL 中没有 diameter 参数，稍后会在获取到 OEM diameter 后自动设置
  const [selectedDiameter, setSelectedDiameter] = useState<number | null>(
    diameterParam ? parseInt(diameterParam, 10) : null
  )
  
  const [fitment, setFitment] = useState<Fitment | null>(null)
  const [wheels, setWheels] = useState<WheelProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [fitmentLoading, setFitmentLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [oemDiameterFront, setOemDiameterFront] = useState<number | null>(null)
  const [oemDiameterRear, setOemDiameterRear] = useState<number | null>(null)
  const [availableDiameters, setAvailableDiameters] = useState<number[]>([])
  const [availableWidths, setAvailableWidths] = useState<WidthFacetItem[]>([])
  const [availableOffsetBuckets, setAvailableOffsetBuckets] = useState<OffsetBucketItem[]>([])
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
          setOemDiameterFront(null)
          setOemDiameterRear(null)
          setAvailableDiameters([])
          setAvailableWidths([])
          setAvailableOffsetBuckets([])
          setLoading(false)
          return
        }
        
        // 解析所有筛选参数（从 URL 的 applied 值）
        const diameterValue = diameterParam ? parseInt(diameterParam, 10) : undefined
        const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined
        const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined
        const minWidth = minWidthParam ? parseFloat(minWidthParam) : undefined
        const maxWidth = maxWidthParam ? parseFloat(maxWidthParam) : undefined
        const minOffset = minOffsetParam ? parseInt(minOffsetParam, 10) : undefined
        const maxOffset = maxOffsetParam ? parseInt(maxOffsetParam, 10) : undefined
        const tpmsCompatible = tpmsParam === 'true' ? true : tpmsParam === 'false' ? false : undefined
        const centerCapIncluded = centerCapParam === 'true' ? true : centerCapParam === 'false' ? false : undefined
        const hubRingIncluded = hubRingParam === 'true' ? true : hubRingParam === 'false' ? false : undefined
        const winterApproved = winterApprovedParam === 'true' ? true : winterApprovedParam === 'false' ? false : undefined
        
        // 请求时传递所有筛选参数给后端
        const response = await getWheelsByVehicle({
          vehicle_id: vehicleId,
          axle: 'both', // 前后轮都匹配
          diameter: diameterValue,
          // Spec 级筛选
          min_price: minPrice,
          max_price: maxPrice,
          min_width: minWidth,
          max_width: maxWidth,
          min_offset: minOffset,
          max_offset: maxOffset,
          tpms_compatible: tpmsCompatible,
          // Product 级筛选
          center_cap_included: centerCapIncluded,
          hub_ring_included: hubRingIncluded,
          winter_approved: winterApproved,
          page,
          page_size: pageSize,
        })
        
        // 保存 OEM diameter 和 facet 数据
        setOemDiameterFront(response.oem_diameter_front)
        setOemDiameterRear(response.oem_diameter_rear)
        setAvailableDiameters(response.available_diameters)
        setAvailableWidths(response.available_widths || [])
        setAvailableOffsetBuckets(response.available_offset_buckets || [])
        
        // 处理 diameter 选择逻辑（A + B：默认选 OEM 或校验 URL 传的 diameter）
        const oemDiameter = response.oem_diameter_front !== null 
          ? response.oem_diameter_front 
          : response.oem_diameter_rear
        
        let effectiveDiameter: number | null = null
        
        if (diameterParam) {
          // B. URL 传了 diameter 参数，校验是否在 available_diameters 中
          const urlDiameter = parseInt(diameterParam, 10)
          if (response.available_diameters.includes(urlDiameter)) {
            effectiveDiameter = urlDiameter
          } else {
            // URL 传的 diameter 不在可用列表中，回退到 All
            effectiveDiameter = null
            // 清理 URL 的 diameter 参数
            const newParams = new URLSearchParams(searchParams.toString())
            newParams.delete('diameter')
            router.replace(`/shop/all?${newParams.toString()}`, { scroll: false })
          }
        } else {
          // A. URL 中没有 diameter 参数，默认选中 OEM diameter（如果可用）
          if (oemDiameter !== null && response.available_diameters.includes(oemDiameter)) {
            effectiveDiameter = oemDiameter
            // 更新 URL（会触发重新加载，因为依赖 vehicleId）
            const newParams = new URLSearchParams(searchParams.toString())
            newParams.set('diameter', oemDiameter.toString())
            router.replace(`/shop/all?${newParams.toString()}`, { scroll: false })
          } else {
            // OEM diameter 不在可用列表中，回退到 All
            effectiveDiameter = null
          }
        }
        
        setSelectedDiameter(effectiveDiameter)
        
        // 使用后端返回的数据（已按 diameter 过滤）
        setWheels(response.items)
        setTotal(response.total)  // 使用后端返回的 total，不要覆盖
      } catch (error) {
        console.error('Failed to load wheels:', error)
        setWheels([])
        setTotal(0)
        setOemDiameterFront(null)
        setOemDiameterRear(null)
        setAvailableDiameters([])
        setAvailableWidths([])
        setAvailableOffsetBuckets([])
      } finally {
        setLoading(false)
      }
    }
    loadWheels()
  }, [
    vehicleId, 
    diameterParam, 
    minPriceParam, 
    maxPriceParam, 
    minWidthParam, 
    maxWidthParam, 
    minOffsetParam, 
    maxOffsetParam, 
    tpmsParam, 
    centerCapParam, 
    hubRingParam, 
    winterApprovedParam, 
    page
  ])  // 依赖所有筛选参数，当 URL 变化时重新请求

  // 处理尺寸按钮点击
  const handleSizeClick = (diameter: number | null) => {
    setPage(1) // 切换尺寸时重置到第一页
    const newParams = new URLSearchParams(searchParams.toString())
    if (diameter === null) {
      newParams.delete('diameter')
    } else {
      newParams.set('diameter', diameter.toString())
    }
    router.push(`/shop/all?${newParams.toString()}`, { scroll: false })
    // URL 变化会触发 loadWheels（因为依赖 diameterParam），不需要手动 setSelectedDiameter
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-6">
      <div className="mb-6 flex items-center text-sm text-slate-500">
        <a href="/" className="hover:text-slate-700">
          Home
        </a>
        <span className="mx-2 text-slate-400">›</span>
        <span className="text-slate-900 font-medium">All Wheels</span>
      </div>

      {/* 两列布局：左侧 Filters，右侧内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* 左侧边栏：Filters */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <FiltersPanel 
            searchParams={searchParams}
            router={router}
            onFilterChange={() => setPage(1)}
            availableWidths={availableWidths}
            availableOffsetBuckets={availableOffsetBuckets}
          />
        </aside>

        {/* 右侧主内容区 */}
        <main className="space-y-6">
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
              {availableDiameters.length > 0 && (oemDiameterFront !== null || oemDiameterRear !== null) && (
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
                  {/* All 按钮 */}
                  <button
                    type="button"
                    onClick={() => handleSizeClick(null)}
                    className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      selectedDiameter === null
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-900'
                    }`}
                  >
                    All
                  </button>
                  
                  {/* 直径按钮 */}
                  {availableDiameters.map((diameter) => {
                    // 确定 OEM diameter（优先用 front，如果 front 没有则用 rear）
                    const oemDiameter = oemDiameterFront !== null ? oemDiameterFront : oemDiameterRear
                    
                    // 计算与 OEM 的差值
                    const diff = oemDiameter !== null ? diameter - oemDiameter : null
                    let label = `${diameter}"`
                    
                    if (diff !== null) {
                      if (diff === 0) {
                        label = `${diameter}"(OEM)`
                      } else if (diff > 0) {
                        label = `${diameter}"(+${diff})`
                      } else {
                        label = `${diameter}"(${diff})`
                      }
                    }
                    
                    const isSelected = diameter === selectedDiameter
                    
                    return (
                      <button
                        key={diameter}
                        type="button"
                        onClick={() => handleSizeClick(diameter)}
                        className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/30'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-900'
                        }`}
                      >
                        {label}
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
        </main>
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
