// app/shop/by-brand/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Find Wheels by Brand | Rimsurge',
}

export default function ByBrandPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* 头部 */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-sky-400">
            Brand Directory
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
            Find wheels by brand
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-[15px]">
            Browse by manufacturer if you already have a brand in mind. We&apos;ll show only
            authentic, Canada-ready stock with duties included。
          </p>
        </div>
      </section>

      {/* 内容 */}
      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-xl shadow-black/40 backdrop-blur">
          <div className="border-b border-slate-800/80 px-6 py-5 md:px-8 md:py-6">
            <h2 className="text-lg font-semibold text-slate-50">By Brand Search</h2>
            <p className="mt-1 text-xs text-slate-300 md:text-sm">
              Pick a wheel manufacturer or open the full brand list to explore everything we carry.
            </p>
          </div>

          <form className="space-y-5 px-6 py-6 md:px-8 md:py-8">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-300">
                Select wheel manufacturer
              </label>
              <select
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-50 outline-none ring-sky-500/0 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
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

            <div className="mt-1 flex flex-col gap-3 border-t border-slate-800 pt-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  🔍 Search Brand
                </button>

                <Link
                  href="/brands"
                  className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-500 hover:text-sky-300"
                >
                  List all brands
                </Link>
              </div>

              <p className="text-xs text-slate-400 md:text-[13px]">
                Brand availability may vary by size and offset. We&apos;ll filter by in-stock items
                first.
              </p>
            </div>
          </form>
        </div>
      </main>

      {/* 小尾部 */}
      <section className="border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-4xl px-6 py-6 text-xs text-slate-400 md:flex md:items-center md:justify-between">
          <span>Looking for a brand you don&apos;t see?</span>
          <div className="mt-2 flex gap-4 md:mt-0">
            <Link href="/contact" className="underline-offset-2 hover:underline">
              Request a brand
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
