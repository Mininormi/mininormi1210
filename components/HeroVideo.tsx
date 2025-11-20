// components/HeroVideo.tsx
export default function HeroVideo() {
  return (
    <div
      className="
        fixed inset-0 
        -z10
        overflow-hidden
        bg-black
        pointer-events-none
      "
    >
      <iframe
        src="https://player.vimeo.com/video/1115222113?background=1&autoplay=1&muted=1&loop=1&dnt=1"
        className="hero-video-frame"
        allow="autoplay; fullscreen; picture-in-picture"
        frameBorder="0"
      />

      {/* 黑色半透明遮罩，保证字可读 */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
