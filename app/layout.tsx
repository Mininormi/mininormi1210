// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";

export const metadata: Metadata = {
  title: "Rimsurge · 东街车房",
  description: "Rimsurge · 东街车房，专注 JDM / 欧系轮毂与改装配件的跨境电商站点。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hans">
<body className="bg-black text-white">
  <HeroVideo />

  <div className="relative z-10 flex min-h-screen flex-col">
    <Header />

    {/* 下面这个 main 继续用你的 max-w-6xl，不会影响视频 */}
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      {children}
    </main>

    <Footer />
  </div>
</body>
    </html>
  );
}
