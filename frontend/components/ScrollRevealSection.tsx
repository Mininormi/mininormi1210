// \components\ScrollRevealSection.tsx

'use client'

import { useEffect, useRef, useState } from 'react'

type ScrollRevealSectionProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function ScrollRevealSection({
  children,
  className = '',
  delay = 0,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === el) {
            // 在视口里 -> 显示动画；离开视口 -> 收回去
            if (entry.isIntersecting) {
              setVisible(true)
            } else {
              setVisible(false)
            }
          }
        })
      },
      {
        threshold: 0.2, // 有 20% 高度进入 / 离开视口就触发
      },
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`
        transform-gpu transition-all duration-700 ease-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
