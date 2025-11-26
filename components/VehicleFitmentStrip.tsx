// components/VehicleFitmentStrip.tsx
'use client'

import { useState } from 'react'

type Option = { value: string; label: string }

const makes: Option[] = [
  { value: '', label: 'Make...' },
  { value: 'honda', label: 'Honda' },
  { value: 'toyota', label: 'Toyota' },
  { value: 'subaru', label: 'Subaru' },
  { value: 'mazda', label: 'Mazda' },
]

const models: Record<string, Option[]> = {
  '': [{ value: '', label: 'Model...' }],
  honda: [
    { value: '', label: 'Model...' },
    { value: 'civic', label: 'Civic' },
    { value: 'accord', label: 'Accord' },
  ],
  toyota: [
    { value: '', label: 'Model...' },
    { value: 'corolla', label: 'Corolla' },
    { value: 'camry', label: 'Camry' },
  ],
}

const engines: Record<string, Option[]> = {
  '': [{ value: '', label: 'Engine...' }],
  civic: [
    { value: '', label: 'Engine...' },
    { value: '20_na', label: '2.0 NA' },
    { value: '15t', label: '1.5T' },
  ],
  corolla: [
    { value: '', label: 'Engine...' },
    { value: '18', label: '1.8' },
    { value: '20', label: '2.0' },
  ],
}

export default function VehicleFitmentStrip() {
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [engine, setEngine] = useState('')

  const modelOptions = models[make] ?? models['']
  const engineOptions = engines[model] ?? engines['']

  // 统一下拉样式：纯黑白灰
  const selectBaseClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/15'

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <div className="rounded-3xl bg-white/98 text-slate-900 shadow-2xl border border-slate-200/80">
        <div className="flex flex-col gap-6 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
          {/* 左侧标题 */}
          <div className="max-w-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-900">
              Vehicle Match
            </p>
            <h2 className="mt-1 text-2xl font-semibold leading-snug md:text-3xl text-slate-900">
              What are you driving?
            </h2>
          </div>

          {/* 右侧下拉 */}
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium text-slate-900">Select vehicle</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              {/* Make */}
              <div className="min-w-[140px] flex-1">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                  Make
                </label>
                <select
                  className={selectBaseClass}
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value)
                    setModel('')
                    setEngine('')
                  }}
                >
                  {makes.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model */}
              <div className="min-w-[140px] flex-1">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                  Model
                </label>
                <select
                  className={selectBaseClass}
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value)
                    setEngine('')
                  }}
                  disabled={!make}
                >
                  {modelOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Engine */}
              <div className="min-w-[140px] flex-1">
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-900">
                  Engine
                </label>
                <select
                  className={selectBaseClass}
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  disabled={!model}
                >
                  {engineOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* CTA 按钮：纯黑系 */}
              <button
                type="button"
                className="
                  mt-1 md:mt-0
                  inline-flex items-center justify-center whitespace-nowrap
                  rounded-2xl
                  bg-slate-900
                  px-5 py-2.5
                  text-xs font-semibold tracking-[0.14em]
                  text-white
                  shadow-md
                  transition
                  hover:bg-black
                "
              >
                Find Wheels
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
