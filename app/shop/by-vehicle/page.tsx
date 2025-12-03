// app/shop/by-vehicle/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Search Wheels by Vehicle | Rimsurge',
}

export default function ByVehiclePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* 头部：页内标题区 */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-sky-400">
            Fitment Search
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
            Search wheels by vehicle
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-[15px]">
            Choose your car and we’ll only show wheels that clear your brakes, hub and fenders.
            Sizes, offsets and bolt patterns are filtered to match real-world fitment data.
          </p>
        </div>
      </section>

      {/* 内容：表单卡片 */}
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl shadow-black/40 backdrop-blur">
          <div className="border-b border-slate-800/80 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-lg font-semibold text-slate-50">By Vehicle Search</h2>
            <p className="mt-1 text-xs text-slate-300 md:text-sm">
              Start with your make and narrow down by model, generation, engine and wheel size. This
              is a static demo – we’ll hook it up to live data later。
            </p>
          </div>

          <form className="space-y-5 px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Make */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Select Make
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose a make…
                  </option>
                  <option value="honda">Honda</option>
                  <option value="mazda">Mazda</option>
                  <option value="subaru">Subaru</option>
                  <option value="toyota">Toyota</option>
                </select>
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Select Model
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose a model…
                  </option>
                  <option value="mx5">MX-5</option>
                  <option value="civic">Civic</option>
                  <option value="wrx">WRX</option>
                  <option value="corolla">Corolla</option>
                </select>
              </div>

              {/* Generation */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Select Generation
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  defaultValue=""
                >
                  <option value="" disabled>
                    e.g. ND (2016–present)…
                  </option>
                  <option value="nd">ND (2016–present)</option>
                  <option value="na">NA (1989–1997)</option>
                  <option value="fk8">FK8 (2017–2021)</option>
                </select>
              </div>

              {/* Engine */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Select Engine
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Choose an engine…
                  </option>
                  <option value="2_0">2.0L</option>
                  <option value="1_5t">1.5T</option>
                  <option value="2_5t">2.5T</option>
                </select>
              </div>

              {/* Wheel size */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                  Select Wheel Size
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                  defaultValue=""
                >
                  <option value="" disabled>
                    All sizes…
                  </option>
                  <option value="17">17&quot;</option>
                  <option value="18">18&quot;</option>
                  <option value="19">19&quot;</option>
                </select>
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-3 border-t border-slate-800 pt-5 md:flex-row md:items-center md:justify-between">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                🔍 Find Wheels
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* 尾部：简单说明区（页面内部的小尾巴，不是站点 Footer） */}
      <section className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-slate-400 md:flex md:items-center md:justify-between">
          <span>Need help with fitment?</span>
          <div className="mt-2 flex gap-4 md:mt-0">
            <Link href="/contact" className="underline-offset-2 hover:underline">
              Chat with us
            </Link>
            <span className="hidden text-slate-500 md:inline">|</span>
            <Link href="/gallery" className="underline-offset-2 hover:underline">
              View customer cars
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
