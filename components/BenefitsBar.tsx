// components/BenefitsBar.tsx
import type { ReactNode } from 'react'

type BenefitItemProps = {
  icon: ReactNode
  title: string
  description: string
}

function BenefitItem({ icon, title, description }: BenefitItemProps) {
  return (
    <div className="flex items-start gap-3 md:gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300">
        {icon}
      </div>
      <div className="space-y-0.5">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <p className="text-xs text-slate-600 leading-snug">{description}</p>
      </div>
    </div>
  )
}

export default function BenefitsBar() {
  return (
    <section className="bg-slate-50">
      <div
        className="
          flex w-full flex-col
          gap-4 px-4 py-4
          md:flex-row md:items-center md:justify-between
          md:gap-6 md:px-8 md:py-5
        "
      >
        {/* 1️⃣ 100% Fitment Guarantee */}
        <BenefitItem
          icon={
            <svg className="h-4 w-4 text-slate-900" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M9 12.5 11 14.5 15 9.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="100% Fitment Guarantee"
          description="Guaranteed after Rimsurge consultation — free replacement if it doesn’t fit."
        />

        {/* 2️⃣ Smart Shipping Options */}
        <BenefitItem
          icon={
            <svg className="h-4 w-4 text-slate-900" viewBox="0 0 24 24" aria-hidden="true">
              <rect
                x="3"
                y="8"
                width="11"
                height="8"
                rx="1.3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M14 10h3.2a1.3 1.3 0 0 1 1.1.6L20.5 13v3H19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="17" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="18" cy="17" r="1.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          }
          title="Smart Shipping Options"
          description="Choose air or sea freight—fair pricing with no padded or hidden fees."
        />

        {/* 3️⃣ Duty paid & pre-cleared */}
        <BenefitItem
          icon={
            <svg className="h-4 w-4 text-slate-900" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3 9.8 6.5H7.2L8 9.2 6 11l2.3.6L7.5 16 12 21l4.5-5-0.8-4.4L18 11l-2-1.8 0.8-2.7h-2.6L12 3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="DUTY PAID & PRE-CLEARED"
          description="All wheels are handled by Rimsurge before sale—no customs, no border fees, no surprises."
        />
      </div>
    </section>
  )
}
