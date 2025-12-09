// app/(app)/about/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | Rimsurge',
  description: 'Learn about Rimsurge · 东街车房 - Your trusted source for JDM and European wheels in Canada.',
}

export default function AboutPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        {/* 页面标题 */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            About Rimsurge
          </h1>
          <p className="mt-3 text-lg text-slate-600 md:text-xl">
            东街车房 · Your Gateway to Authentic JDM & European Wheels
          </p>
        </div>

        {/* 品牌介绍 */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold leading-snug text-slate-900 md:text-3xl">
                A Real Selection From the Heart of Asia&apos;s Motorsport Culture
              </h2>
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                Rimsurge sources directly from the regions where tuning and motorsport culture run
                deepest: Japan, Taiwan, and Mainland China. These are the brands trusted by
                grassroots racers, track-day regulars, and long-time enthusiasts in their own local
                scenes.
              </p>
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                These are not random catalog items; they are real wheels chosen by people who
                actually drive hard. We bring authentic JDM and European wheel culture to
                Canadian enthusiasts, with a focus on quality, fitment accuracy, and genuine
                motorsport heritage.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="aspect-[4/3] w-full max-w-md rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Placeholder · Brand Image
                  </span>
                  <p>
                    这里以后放：
                    <br />
                    Rimsurge 品牌标识
                    <br />
                    或团队照片
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 核心价值 */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Authentic Selection</h3>
            <p className="text-sm text-slate-600">
              We source directly from manufacturers and trusted distributors in Japan, Taiwan, and
              China. Every wheel is authentic and backed by genuine motorsport heritage.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Fitment Guarantee</h3>
            <p className="text-sm text-slate-600">
              Every order goes through a comprehensive pre-fitment check covering vehicle model,
              suspension setup, brake clearance, and your desired stance before shipping.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Canadian Support</h3>
            <p className="text-sm text-slate-600">
              Our Canadian return hub handles everything locally with no cross-border returns. We
              provide compensation or replacements based on verified damage at no additional cost.
            </p>
          </div>
        </div>

        {/* 服务优势 */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">Why Choose Rimsurge?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">Direct Sourcing</h3>
                  <p className="text-sm text-slate-600">
                    We work directly with manufacturers and established distributors in Asia, cutting
                    out middlemen to bring you authentic wheels at competitive prices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">Dual-Channel Shipping</h3>
                  <p className="text-sm text-slate-600">
                    Through our partnership with SY2U, we offer flexible air and sea freight
                    options. Duties and brokerage are included in the price for Canadian customers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">Manual Fitment Review</h3>
                  <p className="text-sm text-slate-600">
                    Every order is manually reviewed using factory data and industry-standard
                    fitment tools. We spot potential issues before shipping, not after.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">Quality Packaging</h3>
                  <p className="text-sm text-slate-600">
                    Packaging and safety standards always stay at the highest level with absolutely
                    no cut corners. Your wheels arrive safely, every time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">Local After-Sales</h3>
                  <p className="text-sm text-slate-600">
                    Our Vancouver-based return hub handles all Canadian returns and replacements
                    locally. No international shipping hassles, no surprise fees.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-slate-900">Expert Consultation</h3>
                  <p className="text-sm text-slate-600">
                    Our team understands fitment, stance, and Canadian driving conditions. We&apos;re
                    here to help you make the right choice for your build.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使命愿景 */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Our Mission</h2>
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                To bridge the gap between Asian motorsport culture and Canadian enthusiasts. We
                believe that authentic JDM and European wheels shouldn&apos;t be limited by geography
                or complicated logistics. Our mission is to make premium wheel culture accessible,
                affordable, and reliable for Canadian drivers.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">Our Vision</h2>
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                To become Canada&apos;s most trusted source for authentic JDM and European wheels.
                We envision a community where Canadian enthusiasts can confidently explore wheel
                options from Asia&apos;s finest manufacturers, backed by expert fitment guidance and
                reliable local support.
              </p>
            </div>
          </div>
        </div>

        {/* CTA 区域 */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-center text-white shadow-lg md:p-12">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">Ready to Find Your Perfect Wheels?</h2>
          <p className="mb-6 text-slate-300 md:text-lg">
            Browse our selection of authentic JDM and European wheels, or get in touch with our
            fitment specialists.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/shop/all"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Browse All Wheels
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

