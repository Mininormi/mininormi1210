// components/HeroVideo.tsx
export default function HeroVideo() {
    return (
      <section className="relative h-screen w-full overflow-hidden">
        {/* Vimeo 全屏背景 iframe */}
        <iframe
          src="https://player.vimeo.com/video/1115222113?background=1&autoplay=1&muted=1&loop=1&autopause=0"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full object-cover"
          style={{ pointerEvents: "none" }} // 不挡住鼠标点击
        ></iframe>
  
        {/* 黑色遮罩，保证上面的文字可读 */}
        <div className="absolute inset-0 bg-black/40" />
  
        {/* 内容层 */}
        <div className="relative z-10 flex h-full items-center px-8 md:px-16">
          <div className="space-y-4 max-w-xl text-white">
            <h1 className="text-4xl font-extrabold md:text-5xl">
              Rimsurge · Wheels Only
            </h1>
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
        </div>
      </section>
    );
  }
  