// components/NewArrivalsSplide.tsx
'use client'

import { Splide, SplideSlide } from '@splidejs/react-splide'
import '@splidejs/react-splide/css'
import Image from 'next/image'

const wheels = [
  {
    name: 'MID M62',
    img: 'https://www.rayswheels.co.jp/lacne/news/upload/new_arrival/New-Arrivals-M62.jpg',
  },
  {
    name: 'M ID Racing 06',
    img: 'https://www.rayswheels.co.jp/lacne/news/upload/new_arrival/New-Arrivals-MIDR06.jpg',
  },
  {
    name: 'gramLIGHTS 57TR',
    img: 'https://www.rayswheels.co.jp/lacne/news/upload/new_arrival/New-Arrivals-57tr.jpg',
  },
  {
    name: 'VOLK RACING GT90',
    img: 'https://www.rayswheels.co.jp/lacne/news/upload/new_arrival/New-Arrivals-GT90.jpg',
  },
]

export default function NewArrivalsSplide() {
  return (
    <section
      className="
        relative
        left-1/2 right-1/2
        ml-[-50vw] mr-[-50vw]
        w-screen
        bg-white
        py-10
      "
    >
      {/* 轮毂轮播：全屏宽，居中+两边露半张 */}
      <Splide
        aria-label="New Rims"
        options={
          {
            type: 'loop',
            focus: 'center', // 中间那张为主
            perPage: 1, // 一页主图 1 张
            gap: '2rem', // 轮毂之间的距离
            padding: { left: '25%', right: '25%' }, // 让左右能露出半张
            pagination: false,
            arrows: true,
            speed: 600,
            breakpoints: {
              768: {
                padding: { left: '10%', right: '10%' },
                gap: '1.5rem',
              },
              1280: {
                padding: { left: '22%', right: '22%' },
              },
            },
          } as any
        }
        className="new-arrivals-splide w-screen"
      >
        {wheels.map((wheel, idx) => (
          <SplideSlide key={idx}>
            <div className="flex flex-col items-center">
              {/* 不用 fill，给死宽高，跟 RAYS 一样用 img 逻辑 */}
              <div className="w-full">
                <Image
                  src={wheel.img}
                  alt={wheel.name}
                  width={960}
                  height={650}
                  className="h-auto w-full object-contain"
                />
              </div>
              <p className="mt-3 text-center text-sm tracking-wide text-neutral-600">
                {wheel.name}
              </p>
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </section>
  )
}
