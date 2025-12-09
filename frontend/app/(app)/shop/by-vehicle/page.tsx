// app/shop/by-vehicle/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Search Wheels by Vehicle | Rimsurge',
}

export default function ByVehiclePage() {
  return (
    <div className="bg-slate-50">
      {/* 表单主体 */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-lg font-semibold text-slate-900">By Vehicle Search</h2>
            <p className="mt-1 text-xs text-slate-600 md:text-sm">
              Start with your make and narrow down by model, generation, engine and wheel size. This
              is a static demo – we’ll hook it up to live data later。
            </p>
          </div>

          <form className="space-y-5 px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Make */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Select make
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Select model
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Select generation
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Select engine
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Select wheel size
                </label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
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

            <div className="mt-1 flex flex-col gap-3 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between">
              <button
                type="submit"
                className="inline-flex items-center justify-center
rounded-full
bg-slate-900
px-6 py-2.5
text-sm font-semibold text-white
shadow-md shadow-slate-900/30
transition
hover:bg-slate-800
active:bg-slate-700
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-slate-900
focus-visible:ring-offset-2
focus-visible:ring-offset-white"
              >
                Find Wheels
              </button>

              <p className="text-xs text-slate-500 md:text-[13px]">
                All results are manually reviewed for brake, hub and fender clearance before
                shipping.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-6 text-xs text-slate-500">
          Need help with fitment?&nbsp;
          <Link href="/contact" className="underline underline-offset-2 hover:text-slate-900">
            Chat with us
          </Link>
        </div>
      </section>
    </div>
  )
}
