// components/HeroVideo.tsx
export default function HeroVideo() {
  return (
    <div className="absolute inset-x-0 top-0 h-[100vh] overflow-hidden bg-black pointer-events-none">
      <video
        className="w-full h-full object-cover"
        src="https://www.weds.co.jp/video/Kranze_leonis_jg_08_maverick_madpv.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}