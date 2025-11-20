// components/HeroVideo.tsx
export default function HeroVideo() {
    return (
      <div className="fixed inset-0 w-screen h-screen -z-50 overflow-hidden">
        <iframe
          src="https://player.vimeo.com/video/1115222113?background=1&autoplay=1&muted=1&loop=1"
          className="absolute top-0 left-0 w-full h-full object-cover"
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          style={{ pointerEvents: "none" }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    );
  }
  