// components/HeroSection.tsx
import HeroVideo from './HeroVideo'
import Image from 'next/image'
import VehicleFitmentStrip from './VehicleFitmentStrip'

export default function HeroSection() {
  return (
    <section
      className="
    relative w-full
    min-h-[680px]
    flex items-center
    pb-40
    md:min-h-[760px]
    md:pb-48
  "
    >
      {' '}
      {/* 背景视频 */}
      <HeroVideo />
      {/* 文案层 */}
      <div className="absolute left-0 right-0 top-[30%] mx-auto max-w-6xl px-4 select-none">
        <div className="space-y-4">
          {/* 主标题 */}
          <h1
            className="
              text-white 
              font-black 
              tracking-tight 
              leading-[1.08]
              text-4xl md:text-6xl
              drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]
            "
          >
            Built for Drivers.
            <br />
            <span className="text-white/90">Priced for Real Life.</span>
          </h1>

          {/* 加拿大标语 Badge */}
          <div
            className="
              inline-flex items-center gap-2
              rounded-full
              bg-white/92
              px-4 py-1.5
              text-[13px] md:text-sm
              font-semibold
              text-slate-900
              shadow-[0_8px_26px_rgba(15,23,42,0.35)]
            "
          >
            <Image
              src="https://cdn-icons-png.freepik.com/256/12363/12363960.png"
              alt="Canada Flag"
              width={18}
              height={18}
              className="rounded-sm"
            />

            <span>A New Canadian Way to Upgrade — Same Quality, Smarter Costs.</span>
          </div>
        </div>
      </div>
      {/* 车辆选择条：桌面端固定在底部一条，手机端自然排版 */}
      <div className="pointer-events-auto w-full">
        <div className="mx-auto hidden w-full md:block md:max-w-6xl md:px-4">
          <div className="pointer-events-auto absolute inset-x-0 bottom-10">
            <VehicleFitmentStrip />
          </div>
        </div>

        {/* 手机端：不用 absolute，避免挡住按钮 */}
        <div className="mt-10 md:hidden">
          <VehicleFitmentStrip />
        </div>
      </div>
    </section>
  )
}
