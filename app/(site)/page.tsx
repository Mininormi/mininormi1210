// app/page.tsx
import HeroSection from '@/components/HeroSection'
import BenefitsBar from '@/components/BenefitsBar'
import NewArrivalsTabs from '@/components/NewArrivalsTabs'
import ScrollRevealSection from '@/components/ScrollRevealSection'

export default function Home() {
  return (
    <>
      {/* 1. 背景视频 + Hero */}
      <HeroSection />

      <main className="space-y-10 px-6 py-10 md:px-16">
        {/* 2. 卖点条 */}
        <BenefitsBar />

        {/* 3. 新到轮毂 / Featured Brands Tabs */}
        <section className="relative z-10">
          <NewArrivalsTabs />
        </section>

        {/* 第一部分：轮毂源头 / JDM 发源地 */}
        <ScrollRevealSection>
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 md:px-10 md:py-14">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              {/* 文案左 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold leading-snug text-slate-900 md:text-3xl">
                  A Real Selection From the Heart of Asia’s Motorsport Culture
                </h2>

                <p className="text-sm text-slate-600 md:text-base">
                  Rimsurge sources directly from the regions where tuning and motorsport culture run
                  deepest: Japan, Taiwan, and Mainland China. These are the brands trusted by
                  grassroots racers, track-day regulars, and long-time enthusiasts in their own
                  local scenes. These are not random catalog items; they are real wheels chosen by
                  people who actually drive hard.
                </p>
              </div>

              {/* 图片右：打破内边距，贴近右侧 */}
              <div className="flex justify-center md:justify-end md:mr-[-2.5rem] lg:mr-[-3.5rem]">
                <div className="aspect-[4/3] w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Placeholder · JDM / Warehouse
                    </span>
                    <p>
                      这里以后放：
                      <br />
                      亚洲仓库 / JDM 场景 / 轮毂墙
                      <br />
                      等源头相关素材图
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        {/* 第二部分：双轨运输 & 价格优势（图片左 文案右） */}
        <ScrollRevealSection>
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 md:px-10 md:py-14">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              {/* 图片左：同样打破内边距到最左侧 */}
              <div className="order-2 flex justify-center md:order-1 md:justify-start md:ml-[-2.5rem] lg:ml-[-3.5rem]">
                <div className="aspect-[4/3] w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Placeholder · Logistics
                    </span>
                    <p>
                      这里以后放：
                      <br />
                      海运 / 空运线路示意
                      <br />
                      或打包 / 集运场景图
                    </p>
                  </div>
                </div>
              </div>

              {/* 文案右 */}
              <div className="order-1 space-y-4 md:order-2">
                <h2 className="text-2xl font-bold leading-snug text-slate-900 md:text-3xl">
                  Air + Sea Dual-Channel Shipping
                  <br />
                  Saving the Cost You Don’t Need to Pay — Never the Quality
                </h2>

                <p className="text-sm text-slate-600 md:text-base">
                  Through our long-term partnership with SY2U, a well-established Canada–Asia
                  logistics provider, we offer a flexible combination of air and sea freight for
                  every wheel order. Packaging and safety standards always stay at the highest level
                  with absolutely no cut corners. What we optimize is the logistics structure, not
                  the quality. You receive a safer and more predictable delivery with a total cost
                  that actually makes sense.
                </p>
              </div>
            </div>
          </section>
        </ScrollRevealSection>

        {/* 第三部分：售后 & 适配保障 */}
        <ScrollRevealSection>
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-10 md:px-10 md:py-14">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              {/* 文案左 */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold leading-snug text-slate-900 md:text-3xl">
                  Pre-Fitment Check. Canadian After-Support.
                </h2>

                <p className="text-sm text-slate-600 md:text-base">
                  Every order goes through a full pre-fitment check that covers vehicle model,
                  suspension setup, brake clearance, and your desired stance. All checks are
                  verified using factory data and industry-standard fitment tools. Our goal is
                  straightforward: to spot and sort out potential issues with offset, width, and
                  clearance before installation, not after the wheels arrive. If any shipping damage
                  or scratches occur, our Canadian return hub handles everything locally with no
                  cross-border returns involved. Once the situation is verified, we will provide
                  compensation based on the level of damage or send a replacement at no additional
                  cost.
                </p>
              </div>

              {/* 图片右：售后 / 仓库占位，同样打破右侧内边距 */}
              <div className="flex justify-center md:justify-end md:mr-[-2.5rem] lg:mr-[-3.5rem]">
                <div className="aspect-[4/3] w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Placeholder · Vancouver Hub
                    </span>
                    <p>
                      这里以后放：
                      <br />
                      温哥华仓库 / 包裹验货
                      <br />
                      或售后流程相关图片
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollRevealSection>
      </main>
    </>
  )
}
