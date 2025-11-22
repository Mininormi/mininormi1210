// app/page.tsx
import HeroVideo from '@/components/HeroVideo'
import BenefitsBar from '@/components/BenefitsBar'
import NewArrivalsSplide from '@/components/NewArrivalsSplide'

export default function Home() {
  return (
    <>
      {/* 1. 背景视频 */}
      <HeroVideo />

      <main className="relative z-10 space-y-10 px-6 pt-16 pb-16 md:px-16 md:pt-24">
        {/* 1. Hero 文案层：主 Slogan + 两个入口按钮 */}
        <section
          className="
            flex min-h-[520px] items-center
            text-white
            md:min-h-[640px]
          "
        >
          <div className="space-y-4 max-w-xl">
            <h1 className="text-4xl font-extrabold md:text-5xl">Rimsurge · Wheels Only</h1>

            <p className="text-lg text-slate-200">
              改装轮毂 & OEM 原厂轮毂，专注加拿大市场的专业轮毂商店。
            </p>

            <div className="mt-4 flex gap-4">
              <a
                href="/aftermarket"
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-slate-200"
              >
                改装轮毂
              </a>

              <a
                href="/oem"
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-white hover:border-white"
              >
                OEM 原厂轮毂
              </a>
            </div>
          </div>
        </section>

        {/* 2. 卖点条 */}
        <BenefitsBar />

        {/* 3. 新到轮毂轮播 */}
        <section className="relative z-10">
          <NewArrivalsSplide />
        </section>

        {/* 4. 两个主入口卡片：Aftermarket / OEM */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Aftermarket 卡片 */}
          <a
            href="/aftermarket"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Aftermarket
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">
              改装轮毂 · 轻量化 / JDM / Track Style
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              针对赛道、街道和姿态玩家的改装轮毂，支持按尺寸、PCD、ET、颜色快速筛选。
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900 group-hover:underline">
              浏览全部改装轮毂 →
            </p>
          </a>

          {/* OEM 卡片 */}
          <a
            href="/oem"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">OEM</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">OEM 原厂轮毂 · 换一只不心疼</h2>
            <p className="mt-2 text-sm text-slate-600">
              覆盖日系 / 德系热门车型原厂轮毂，适合修复划伤、补齐、事故更换。
            </p>
            <p className="mt-4 text-sm font-semibold text-slate-900 group-hover:underline">
              浏览全部 OEM 轮毂 →
            </p>
          </a>
        </section>

        {/* 5. 品牌说明区（原来的渐变 Hero，降级成 About Block） */}
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-10 text-white md:px-10 md:py-14">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">WHY RIMSURGE</p>
            <h2 className="text-3xl font-black leading-tight md:text-4xl">
              改装轮毂 & OEM 原厂轮毂，只做懂车人需要的那一圈金属。
            </h2>
            <p className="text-sm text-slate-300 md:text-base">
              Rimsurge 专注 JDM / 欧系改装轮毂与 OEM 原厂替换轮毂，
              面向加拿大用户提供实在参数、真实库存与靠谱发货。
            </p>
          </div>
        </section>

        {/* 6. 热门轮毂占位区 */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">热门轮毂（后面接 Shopify 数据）</h2>
          <p className="text-sm text-slate-600">
            这里以后会显示从 Shopify 拉过来的精选款式。现在可以先用假数据占位，确认布局和设计。
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Placeholder · 以后换成真实商品卡片
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Placeholder · 商品卡片
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Placeholder · 商品卡片
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
