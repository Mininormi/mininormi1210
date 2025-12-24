'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getYears,
  getMakes,
  getModels,
  getVehicles,
  type Year,
  type Make,
  type Model,
  type Vehicle,
} from '@/lib/api/vehicles'

type Step = 'year' | 'make' | 'model' | 'vehicle'

export default function ByVehiclePage() {
  const router = useRouter()

  // 状态管理
  const [years, setYears] = useState<Year[]>([])
  const [makes, setMakes] = useState<Make[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const [selectedYear, setSelectedYear] = useState<number | ''>('')
  const [selectedMakeId, setSelectedMakeId] = useState<number | ''>('')
  const [selectedModelId, setSelectedModelId] = useState<number | ''>('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | ''>('')

  const [activeStep, setActiveStep] = useState<Step>('year')
  const [loading, setLoading] = useState({
    years: false,
    makes: false,
    models: false,
    vehicles: false,
  })

  // 加载年份列表
  useEffect(() => {
    const loadYears = async () => {
      setLoading((prev) => ({ ...prev, years: true }))
      try {
        const data = await getYears()
        setYears(data)
      } catch (error) {
        console.error('Failed to load years:', error)
      } finally {
        setLoading((prev) => ({ ...prev, years: false }))
      }
    }
    loadYears()
  }, [])

  // 当选择年份时，加载品牌
  useEffect(() => {
    if (!selectedYear) {
      setMakes([])
      setSelectedMakeId('')
      return
    }

    const loadMakes = async () => {
      setLoading((prev) => ({ ...prev, makes: true }))
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e2a94ee8-06b0-4b36-a7b4-a3820ae00c2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-vehicle/page.tsx:67',message:'Loading makes started',data:{selectedYear},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const data = await getMakes(selectedYear as number)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e2a94ee8-06b0-4b36-a7b4-a3820ae00c2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-vehicle/page.tsx:70',message:'Makes data received',data:{makesCount:data?.length||0,firstMake:data?.[0],makes:data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.log('Makes data:', data)
        setMakes(data)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e2a94ee8-06b0-4b36-a7b4-a3820ae00c2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-vehicle/page.tsx:73',message:'Makes state updated',data:{makesCount:data?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e2a94ee8-06b0-4b36-a7b4-a3820ae00c2c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'by-vehicle/page.tsx:75',message:'Failed to load makes',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.error('Failed to load makes:', error)
        setMakes([])
      } finally {
        setLoading((prev) => ({ ...prev, makes: false }))
      }
    }
    loadMakes()
  }, [selectedYear])

  // 当选择品牌时，加载型号
  useEffect(() => {
    if (!selectedMakeId || !selectedYear) {
      setModels([])
      setSelectedModelId('')
      return
    }

    const loadModels = async () => {
      setLoading((prev) => ({ ...prev, models: true }))
      try {
        const data = await getModels(selectedMakeId as number, selectedYear as number)
        setModels(data)
      } catch (error) {
        console.error('Failed to load models:', error)
        setModels([])
      } finally {
        setLoading((prev) => ({ ...prev, models: false }))
      }
    }
    loadModels()
  }, [selectedMakeId, selectedYear])

  // 当选择型号时，加载车辆
  useEffect(() => {
    if (!selectedModelId || !selectedMakeId || !selectedYear) {
      setVehicles([])
      setSelectedVehicleId('')
      return
    }

    const loadVehicles = async () => {
      setLoading((prev) => ({ ...prev, vehicles: true }))
      try {
        const data = await getVehicles(
          selectedYear as number,
          selectedMakeId as number,
          selectedModelId as number
        )
        setVehicles(data)
      } catch (error) {
        console.error('Failed to load vehicles:', error)
        setVehicles([])
      } finally {
        setLoading((prev) => ({ ...prev, vehicles: false }))
      }
    }
    loadVehicles()
  }, [selectedModelId, selectedMakeId, selectedYear])

  // 处理步骤选择
  const handleStepClick = (step: Step) => {
    const stepOrder: Step[] = ['year', 'make', 'model', 'vehicle']
    const currentIndex = stepOrder.indexOf(activeStep)
    const clickedIndex = stepOrder.indexOf(step)

    if (clickedIndex <= currentIndex + 1) {
      setActiveStep(step)
    }
  }

  // 处理车辆选择完成后的跳转
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId)
    // 跳转到 /shop/all
    router.push(`/shop/all?vehicle_id=${vehicleId}`)
  }

  // 获取步骤显示文本
  const getStepLabel = (step: Step): string => {
    switch (step) {
      case 'year':
        return selectedYear ? selectedYear.toString() : '1. Year'
      case 'make':
        const make = makes.find((m) => m.id === selectedMakeId)
        return make ? `2. ${make.name}` : '2. Make'
      case 'model':
        const model = models.find((m) => m.id === selectedModelId)
        return model ? `3. ${model.name}` : '3. Model'
      case 'vehicle':
        const vehicle = vehicles.find((v) => v.vehicle_id === selectedVehicleId)
        return vehicle ? `4. ${vehicle.vehicle_name || vehicle.vehicle_id}` : '4. Vehicle'
      default:
        return ''
    }
  }

  // 判断步骤是否完成
  const isStepComplete = (step: Step): boolean => {
    switch (step) {
      case 'year':
        return !!selectedYear
      case 'make':
        return !!selectedMakeId
      case 'model':
        return !!selectedModelId
      case 'vehicle':
        return !!selectedVehicleId
      default:
        return false
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-6">
        {/* Stepper 导航 */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-4">
          {(['year', 'make', 'model', 'vehicle'] as Step[]).map((step, index) => {
            const isComplete = isStepComplete(step)
            const isActive = activeStep === step
            const isClickable = index === 0 || isStepComplete(['year', 'make', 'model', 'vehicle'][index - 1] as Step)

            return (
              <div key={step} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => isClickable && handleStepClick(step)}
                  disabled={!isClickable}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-red-500 text-white'
                      : isComplete
                      ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                      : 'bg-slate-100 text-slate-500'
                  } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                >
                  {getStepLabel(step)}
                </button>
                {index < 3 && <span className="text-slate-400">›</span>}
              </div>
            )
          })}
          {/* 搜索图标 */}
          <div className="ml-auto">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
                >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
              </div>

        {/* 选择面板 */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {activeStep === 'year' && (
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Select Year</h3>
              <div className="max-h-96 overflow-y-auto">
                {loading.years ? (
                  <div className="py-8 text-center text-slate-500">Loading...</div>
                ) : (
                  <div className="space-y-1">
                    {years.map((year) => (
                      <button
                        key={year.id}
                        type="button"
                        onClick={() => {
                          setSelectedYear(year.year)
                          setActiveStep('make')
                        }}
                        className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {year.year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
          )}

          {activeStep === 'make' && selectedYear && (
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Select Make</h3>
              <div className="max-h-96 overflow-y-auto">
                {loading.makes ? (
                  <div className="py-8 text-center text-slate-500">Loading...</div>
                ) : makes.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">No makes found (makes.length: {makes.length})</div>
                ) : (
                  <div className="space-y-1">
                    {makes.map((make) => (
                      <button
                        key={make.id}
                        type="button"
                        onClick={() => {
                          setSelectedMakeId(make.id)
                          setActiveStep('model')
                        }}
                        className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {make.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
          )}

          {activeStep === 'model' && selectedMakeId && selectedYear && (
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Select Model</h3>
              <div className="max-h-96 overflow-y-auto">
                {loading.models ? (
                  <div className="py-8 text-center text-slate-500">Loading...</div>
                ) : (
                  <div className="space-y-1">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModelId(model.id)
                          setActiveStep('vehicle')
                        }}
                        className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {model.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeStep === 'vehicle' && selectedModelId && selectedMakeId && selectedYear && (
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Select Vehicle</h3>
              <div className="max-h-96 overflow-y-auto">
                {loading.vehicles ? (
                  <div className="py-8 text-center text-slate-500">Loading...</div>
                ) : vehicles.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">No vehicles found</div>
                ) : (
                  <div className="space-y-1">
                    {vehicles.map((vehicle) => (
              <button
                        key={vehicle.vehicle_id}
                        type="button"
                        onClick={() => handleVehicleSelect(vehicle.vehicle_id)}
                        className="w-full rounded-lg px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-100"
                      >
                        {vehicle.vehicle_name || vehicle.vehicle_id}
              </button>
                    ))}
                  </div>
                )}
            </div>
        </div>
          )}
        </div>
      </section>
    </div>
  )
}
