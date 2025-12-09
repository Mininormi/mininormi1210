// app/shop/by-brand/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Find Wheels by Brand | Rimsurge',
}

export default function ByBrandPage() {
  return (
    <div className="bg-slate-50">
      {/* 表单主体 */}
      <section className="mx-auto max-w-4xl px-4 py-10 md:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-lg font-semibold text-slate-900">By Brand Search</h2>
            <p className="mt-1 text-xs text-slate-600 md:text-sm">
              Pick a wheel manufacturer or open the full brand list to explore everything we carry.
            </p>
          </div>

          <form className="space-y-5 px-6 py-6 md:px-8 md:py-8">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                Select wheel manufacturer
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose a brand…
                </option>
                <option value="rays">RAYS</option>
                <option value="weds">WedsSport</option>
                <option value="enkei">Enkei</option>
                <option value="work">WORK</option>
                <option value="oem">OEM / Factory</option>
              </select>
            </div>

            <div className="mt-1 flex flex-col gap-3 border-t border-slate-200 pt-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row">
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
                  Search Brand
                </button>

                <Link
                  href="/brands"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-sky-500 hover:text-sky-600"
                >
                  List all brands
                </Link>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
