// app/(app)/shop/accessories/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Wheel Accessories | Rimsurge',
}

type AccessoryCard = {
  id: string
  category: string
  brand: string
  name: string
  originalPrice: string
  salePrice: string
  compatibility: string[]
  inStock: boolean
}

const mockAccessories: AccessoryCard[] = [
  {
    id: '1',
    category: 'Center Caps',
    brand: 'RAYS',
    name: 'Volk Racing Center Cap Set (4pcs)',
    originalPrice: '$89',
    salePrice: '$79',
    compatibility: ['TE37', 'CE28', 'RE30'],
    inStock: true,
  },
  {
    id: '2',
    category: 'Lug Nuts',
    brand: 'Muteki',
    name: 'SR48 Open End Lug Nuts - Black',
    originalPrice: '$129',
    salePrice: '$109',
    compatibility: ['12x1.5', '12x1.25', '14x1.5'],
    inStock: true,
  },
  {
    id: '3',
    category: 'Wheel Spacers',
    brand: 'H&R',
    name: 'TRAK+ Wheel Spacer Kit 15mm',
    originalPrice: '$199',
    salePrice: '$179',
    compatibility: ['5x114.3', '5x112', '5x120'],
    inStock: true,
  },
  {
    id: '4',
    category: 'Hub Rings',
    brand: 'Generic',
    name: 'Hub Centric Rings Set (4pcs) - 73.1mm to 66.1mm',
    originalPrice: '$29',
    salePrice: '$24',
    compatibility: ['Universal'],
    inStock: true,
  },
  {
    id: '5',
    category: 'Wheel Decals',
    brand: 'Custom',
    name: 'RAYS Engineering Wheel Decal Set',
    originalPrice: '$19',
    salePrice: '$15',
    compatibility: ['Universal'],
    inStock: true,
  },
  {
    id: '6',
    category: 'Valve Stems',
    brand: 'TPMS',
    name: 'TPMS Valve Stem Kit - Silver',
    originalPrice: '$149',
    salePrice: '$129',
    compatibility: ['Universal'],
    inStock: true,
  },
  {
    id: '7',
    category: 'Center Caps',
    brand: 'WedsSport',
    name: 'WedsSport Center Cap Set (4pcs)',
    originalPrice: '$95',
    salePrice: '$85',
    compatibility: ['SA-25R', 'TC105X', 'Kranze'],
    inStock: true,
  },
  {
    id: '8',
    category: 'Lug Nuts',
    brand: 'Project Kics',
    name: 'R40 Neo Chrome Lug Nuts',
    originalPrice: '$249',
    salePrice: '$219',
    compatibility: ['12x1.5', '12x1.25'],
    inStock: true,
  },
  {
    id: '9',
    category: 'Wheel Spacers',
    brand: 'Eibach',
    name: 'Pro-Spacer Wheel Spacer Kit 20mm',
    originalPrice: '$229',
    salePrice: '$199',
    compatibility: ['5x114.3', '5x100'],
    inStock: true,
  },
]

export default function AccessoriesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-6">
      <div className="mb-6 flex items-center text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-700">
          Home
        </Link>

        <span className="mx-2 text-slate-400">›</span>

        <span className="text-slate-900 font-medium">Accessories</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,_1fr)]">
        {/* 左侧筛选栏 */}
        <aside className="space-y-4">
          {/* Category */}
          <details className="rounded-2xl border border-slate-200 bg-white" open>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900">
              <span>Category</span>
              <span className="text-xs font-normal text-slate-500">Select one</span>
            </summary>
            <div className="border-t border-slate-200 px-4 py-3">
              <div className="space-y-2 text-sm text-slate-700">
                {['All', 'Center Caps', 'Lug Nuts', 'Wheel Spacers', 'Hub Rings', 'Wheel Decals', 'Valve Stems'].map((category) => (
                  <label key={category} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      defaultChecked={category === 'All'}
                      className="h-3.5 w-3.5 border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>

          {/* Brand */}
          <details className="rounded-2xl border border-slate-200 bg-white" open>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900">
              <span>Brand</span>
              <span className="text-xs font-normal text-slate-500">Pick one</span>
            </summary>
            <div className="border-t border-slate-200 px-4 py-3">
              <div className="space-y-2 text-sm text-slate-700">
                {['All Brands', 'RAYS', 'WedsSport', 'Muteki', 'Project Kics', 'H&R', 'Eibach', 'TPMS', 'Generic'].map((brand) => (
                  <label key={brand} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="brand"
                      defaultChecked={brand === 'All Brands'}
                      className="h-3.5 w-3.5 border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          </details>

          {/* Compatibility */}
          <details className="rounded-2xl border border-slate-200 bg-white" open>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900">
              <span>Compatibility</span>
              <span className="text-xs font-normal text-slate-500">Filter</span>
            </summary>
            <div className="border-t border-slate-200 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {['5x114.3', '5x112', '5x120', '5x100', '12x1.5', '12x1.25', '14x1.5', 'Universal'].map((compat) => (
                  <button
                    key={compat}
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-100"
                  >
                    {compat}
                  </button>
                ))}
              </div>
            </div>
          </details>

          {/* Price Range */}
          <details className="rounded-2xl border border-slate-200 bg-white" open>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900">
              <span>Price Range</span>
              <span className="text-xs font-normal text-slate-500">CAD</span>
            </summary>
            <div className="border-t border-slate-200 px-4 py-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Example: $20 – $200</p>
            </div>
          </details>

          {/* Stock Status */}
          <details className="rounded-2xl border border-slate-200 bg-white" open>
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900">
              <span>Stock Status</span>
            </summary>
            <div className="border-t border-slate-200 px-4 py-3">
              <div className="space-y-2 text-sm text-slate-700">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="stock"
                    defaultChecked
                    className="h-3.5 w-3.5 border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>All items</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="stock"
                    className="h-3.5 w-3.5 border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>In stock only</span>
                </label>
              </div>
            </div>
          </details>
        </aside>

        {/* 右侧内容区 */}
        <div className="space-y-6">
          {/* 页面标题和说明 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Wheel Accessories
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Complete your wheel setup with quality accessories including center caps, lug nuts,
              wheel spacers, hub rings, decals, and valve stems. All accessories are compatible
              with our wheel selection and ready to ship.
            </p>
          </div>

          {/* Accessories 列表 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                All Accessories ·{' '}
                <span className="font-normal text-slate-500">
                  Showing {mockAccessories.length} items
                </span>
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Sort by</span>
                <select className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                  <option>Recommended</option>
                  <option>Price: low to high</option>
                  <option>Price: high to low</option>
                  <option>Newest</option>
                  <option>Category</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {mockAccessories.map((accessory) => (
                <article
                  key={accessory.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* 主图 */}
                  <Link href={`/shop/accessories/${accessory.id}`} className="block">
                    <div className="aspect-square w-full bg-slate-100" />
                  </Link>

                  <div className="flex flex-1 flex-col gap-3 px-4 py-3">
                    {/* 头部：Category + Brand */}
                    <div className="flex min-h-[4rem] flex-col justify-between">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                          {accessory.category}
                        </span>
                        {accessory.inStock && (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 whitespace-nowrap">
                            In Stock
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {accessory.brand}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-900 line-clamp-2">
                          {accessory.name}
                        </h3>
                      </div>
                    </div>

                    {/* 兼容性 */}
                    <div className="flex flex-wrap gap-1.5">
                      {accessory.compatibility.slice(0, 3).map((comp, idx) => (
                        <span
                          key={`${accessory.id}-comp-${idx}`}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {comp}
                        </span>
                      ))}
                      {accessory.compatibility.length > 3 && (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          +{accessory.compatibility.length - 3}
                        </span>
                      )}
                    </div>

                    {/* 价格 */}
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {accessory.salePrice} CAD
                        </span>
                        {accessory.originalPrice !== accessory.salePrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {accessory.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Duties included for Canada
                      </p>
                    </div>

                    {/* 底部按钮 */}
                    <div className="mt-auto flex items-center justify-end pt-2">
                      <Link
                        href={`/shop/accessories/${accessory.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-black"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* 分页 */}
            <nav className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-600">
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-900"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white"
                >
                  1
                </button>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] text-slate-700 hover:border-slate-900"
                >
                  2
                </button>
              </div>
              <button
                type="button"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-slate-900"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}

