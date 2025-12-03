// app/shop/by-pcd/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Find Wheels by PCD | Rimsurge',
}

export default function ByPcdPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* 头部 */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-sky-400">
            Bolt Pattern Search
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
            Find wheels by PCD
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-[15px]">
            Already know your bolt pattern? Filter wheels by PCD and wheel diameter to quickly see
            every design that physically bolts up to your car.
          </p>
        </div>
      </section>

      {/* 内容 */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl shadow-black/40 backdrop-blur">
          <div className="border-b border-slate-800/80 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-lg font-semibold text-slate-50">By PCD Search</h2>
            <p className="mt-1 text-xs text-slate-300 md:text-sm">
              Choose your bolt pattern and optionally limit by wheel size. We’ll return everything
              in stock that matches.
            </p>
          </div>

          <form className="space-y-5 px-6 py-6 md:px-8 md:py-8">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                Select a PCD
              </label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                defaultValue=""
              >
                <option value="" disabled>
                  e.g. 5x114.3, 5x112…
                </option>
                <option value="4x100">4x100</option>
                <option value="5x100">5x100</option>
                <option value="5x112">5x112</option>
                <option value="5x114_3">5x114.3</option>
                <option value="5x120">5x120</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                Limit by wheel size
              </label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                defaultValue="all"
              >
                <option value="all">All sizes</option>
                <option value="17">17&quot;</option>
                <option value="18">18&quot;</option>
                <option value="19">19&quot;</option>
                <option value="20">20&quot;</option>
              </select>
            </div>

            <div className="mt-1 flex flex-col gap-3 border-t border-slate-800 pt-5 md:flex-row md:items-center md:justify-between">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                🔍 Find Wheels by PCD
              </button>

              <p className="text-xs text-slate-400 md:text-[13px]">
                PCD search assumes correct centre bore and brake clearance will be checked at
                checkout.
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* 小尾部 */}
      <section className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-6 text-xs text-slate-400 md:flex md:items-center md:justify-between">
          <span>Don&apos;t know your PCD?</span>
          <div className="mt-2 flex gap-4 md:mt-0">
            <Link href="/fitment-guide" className="underline-offset-2 hover:underline">
              View fitment guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
