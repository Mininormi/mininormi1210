// \app\shop\products\[slug]\page.tsx
// 本地修改
export default function ProductDetailPage() {
  // 先写死一套 mock 数据，后面你再接真实 API
  const wheel = {
    brand: 'RAYS',
    name: 'Volk Racing TE37 Saga S-Plus',
    tagLine: 'Forged JDM classic with modern fitment support',
    salePrice: '$2,899',
    originalPrice: '$3,299',
    per: 'Per set of 4 wheels',
    inStockText: 'In stock · Ships in 2–4 business days from Canada',
    sizeOptions: ['17×8.0 +35', '17×9.0 +38', '18×8.5 +35'],
    finishOptions: ['Bronze', 'Diamond Dark Gunmetal', 'Matte Black'],
    specs: {
      diameter: '18"',
      width: '8.5J',
      pcd: '5×114.3',
      offset: '+35',
      centerBore: '73.1 mm (hub rings included for your car)',
      construction: 'Forged, 1-piece',
      origin: 'Made in Japan',
      weight: '8.9 kg per wheel (approx.)',
      loadRating: '690 kg per wheel',
      winterUse: 'Suitable for winter use when properly cared for',
    },
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-8">
      {/* 面包屑 */}
      <div className="mb-6 flex items-center text-sm text-slate-500">
        <a href="/" className="hover:text-slate-700">
          Home
        </a>
        <span className="mx-2 text-slate-400">›</span>
        <a href="/shop/all" className="hover:text-slate-700">
          All Wheels
        </a>
        <span className="mx-2 text-slate-400">›</span>
        <span className="text-slate-900 font-medium line-clamp-1">{wheel.name}</span>
      </div>

      {/* 顶部主区域 */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)]">
        {/* 左侧图片区域 */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {/* 主图占位：后面你可以换成真实 <Image /> */}
            <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
            {/* 左上角角标 */}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center rounded-full bg-black/70 px-3 py-1 font-medium text-slate-50 backdrop-blur">
                Rimsurge Fitment Review Included
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-900/40 px-3 py-1 font-medium text-slate-100 backdrop-blur">
                Duties Included for Canadian delivery
              </span>
            </div>
            {/* 右下角尺寸提示 */}
            <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-slate-50 backdrop-blur">
              Example shown: 18×8.5 +35 · 5×114.3
            </div>
          </div>

          {/* 缩略图占位 */}
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                <div className="h-full w-full bg-slate-800/90" />
              </div>
            ))}
          </div>
        </div>

        {/* 右侧信息区域 */}
        <div className="space-y-6">
          {/* 标题 & 品牌 */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              {wheel.brand}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {wheel.name}
            </h1>
            <p className="text-sm text-slate-600">{wheel.tagLine}</p>

            {/* tags */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700 ring-1 ring-emerald-100">
                Forged monoblock
              </span>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-700 ring-1 ring-sky-100">
                Track & daily use
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 ring-1 ring-slate-200">
                Winter-capable finish
              </span>
            </div>
          </div>

          {/* 价格区块 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">
                    {wheel.salePrice}
                  </p>
                  <p className="text-sm text-slate-400 line-through">{wheel.originalPrice}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{wheel.per}</p>
                <p className="mt-1 text-xs font-medium text-emerald-700">{wheel.inStockText}</p>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <p>All pricing in CAD</p>
                <p>Duties & brokerage included</p>
              </div>
            </div>
          </div>

          {/* 尺寸 / 颜色选择 */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            {/* Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Select size</p>
                <p className="text-[11px] text-slate-500">
                  We’ll re-check fitment for your car before shipping
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {wheel.sizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 hover:border-slate-900 hover:bg-slate-100"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Select finish</p>
              <div className="flex flex-wrap items-center gap-3">
                {wheel.finishOptions.map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:border-slate-900 hover:bg-slate-50"
                  >
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-slate-900" />
                    {finish}
                  </button>
                ))}
              </div>
            </div>

            {/* 车辆适配 CTA */}
            <div className="mt-1 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600">
              <p className="font-semibold text-slate-900">Not sure if this fits?</p>
              <p className="mt-0.5">
                Add your vehicle at checkout or send us your current wheel specs. Every order gets a
                manual fitment review before it ships.
              </p>
            </div>
          </div>

          {/* CTA 按钮 */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/30 transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            >
              Add to cart
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-900/10 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
            >
              Talk to a fitment specialist
            </button>
          </div>
        </div>
      </div>

      {/* 卖点卡片 */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">100% Fitment Review</p>
          <p className="text-xs text-slate-600">
            Every order is checked against your vehicle before we ship. If something doesn’t look
            right, we’ll contact you before anything leaves the warehouse.
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Smart Shipping</p>
          <p className="text-xs text-slate-600">
            Choose air or sea options for Canada-wide delivery. We balance speed, cost, and border
            fees so you don’t get surprise charges when the wheels arrive.
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Winter Ready</p>
          <p className="text-xs text-slate-600">
            Many finishes are winter-capable with proper care. Ask us for recommendations if you’re
            planning to run these through Canadian winters.
          </p>
        </div>
      </div>

      {/* 下半部分：详情 + 规格 */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,_1.3fr)_minmax(0,_1fr)]">
        {/* 左侧详情 */}
        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          {/* Overview */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Overview
            </h2>
            <p className="text-sm text-slate-700">
              TE37 Saga S-Plus keeps the iconic six-spoke look while meeting modern strength and
              weight targets. It’s a forged wheel that works both for daily driving and occasional
              track days, with sizes that suit popular Japanese and European platforms.
            </p>
            <p className="text-sm text-slate-700">
              This spec is hand-picked for common sport compact and performance sedans in Canada. We
              focus on brake clearance, inside barrel clearance, and practical tyre sizes instead of
              just “aggressive” numbers.
            </p>
          </section>

          {/* What's included */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              What&apos;s included
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>4× {wheel.name} wheels in your chosen size and finish</li>
              <li>Center caps where supplied by the manufacturer</li>
              <li>Hub-centric rings if required for your vehicle</li>
              <li>Rimsurge manual fitment review before shipping (no extra cost)</li>
            </ul>
          </section>

          {/* Shipping & returns */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Shipping & returns
            </h2>
            <p className="text-sm text-slate-700">
              Wheels ship from Canadian warehouses or partner distributors. For most addresses we
              offer both faster air options and slower sea-based options with lower cost. Duties and
              brokerage are baked into the price for Canadian customers.
            </p>
            <p className="text-sm text-slate-700">
              If there&apos;s any fitment issue based on information you provide us, we&apos;ll work
              with you to resolve it — before or after the wheels ship.
            </p>
          </section>
        </div>

        {/* 右侧规格表 */}
        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Technical specs
          </h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-slate-700">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Diameter</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.diameter}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Width</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.width}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">PCD</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.pcd}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Offset (ET)</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.offset}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Center bore</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.centerBore}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Construction</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.construction}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Origin</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.origin}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Weight</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.weight}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Load rating</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.loadRating}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">Winter use</dt>
              <dd className="text-sm font-medium text-slate-900">{wheel.specs.winterUse}</dd>
            </div>
          </dl>

          <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600">
            <p className="font-semibold text-slate-900">Need more detail?</p>
            <p className="mt-0.5">
              Send us your current wheel and tyre specs and we&apos;ll confirm brake clearance and
              inner clearance before you order.
            </p>
          </div>
        </aside>
      </div>

      {/* 推荐区域：先简单放个占位结构 */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            You might also like
          </h2>
          <a href="/shop/all" className="text-xs font-medium text-slate-700 hover:text-slate-900">
            Browse all wheels →
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <div className="relative">
                <div className="aspect-[4/3] w-full bg-slate-900/80 transition group-hover:brightness-110" />
              </div>
              <div className="flex flex-1 flex-col gap-1 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Sample Brand
                </p>
                <p className="line-clamp-3 text-sm font-medium text-slate-900">
                  Sample Wheel Name Flow Form
                </p>
                <div className="mt-1 flex items-baseline gap-2 text-sm">
                  <span className="font-semibold text-slate-900">$1,999</span>
                  <span className="text-xs text-slate-400 line-through">$2,199</span>
                </div>
                <div className="mt-2 flex items-center justify-between pt-1">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-slate-900" />
                    <span className="h-3 w-3 rounded-full bg-zinc-200" />
                    <span className="h-3 w-3 rounded-full bg-amber-700" />
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-semibold text-slate-900 underline underline-offset-2"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
