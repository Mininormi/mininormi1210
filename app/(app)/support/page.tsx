// app/(app)/support/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Support & After-Sales | Rimsurge',
  description: 'Rimsurge after-sales support, return policy, warranty information, and customer service for Canadian customers.',
}

export default function SupportPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        {/* 页面标题 */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Support & After-Sales
          </h1>
          <p className="mt-3 text-lg text-slate-600 md:text-xl">
            Canadian Return Hub · Local Support · No Cross-Border Hassles
          </p>
        </div>

        {/* 核心售后承诺 */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Pre-Fitment Check. Canadian After-Support.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                Every order goes through a full pre-fitment check that covers vehicle model,
                suspension setup, brake clearance, and your desired stance. All checks are verified
                using factory data and industry-standard fitment tools.
              </p>
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                Our goal is straightforward: to spot and sort out potential issues with offset,
                width, and clearance before installation, not after the wheels arrive.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                If any shipping damage or scratches occur, our Canadian return hub handles everything
                locally with no cross-border returns involved. Once the situation is verified, we
                will provide compensation based on the level of damage or send a replacement at no
                additional cost.
              </p>
              <p className="text-sm font-semibold text-slate-900 md:text-base">
                All returns and replacements are processed through our Vancouver-based facility —
                no international shipping required.
              </p>
            </div>
          </div>
        </div>

        {/* 售后流程 */}
        <div className="mb-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">After-Sales Process</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* 步骤 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Report Issue</h3>
              <p className="text-sm text-slate-600">
                Contact us within 7 days of delivery with photos and a description of the issue.
                Include your order number and photos showing the damage or fitment problem.
              </p>
            </div>

            {/* 步骤 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Verification</h3>
              <p className="text-sm text-slate-600">
                Our team reviews your case within 24-48 hours. We verify the issue using your
                photos and order details. For fitment issues, we may request additional vehicle
                information.
              </p>
            </div>

            {/* 步骤 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Resolution</h3>
              <p className="text-sm text-slate-600">
                Once verified, we provide compensation or arrange a replacement. Returns are
                processed through our Vancouver hub — you ship locally, we handle the rest.
              </p>
            </div>
          </div>
        </div>

        {/* 退货政策 */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">Return Policy</h2>
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Eligible Returns</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>
                    Shipping damage or defects verified within 7 days of delivery
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>
                    Fitment issues that couldn&apos;t be resolved through our pre-shipment review
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>
                    Wrong item received (verified against order confirmation)
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-b border-slate-100 pb-4">
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Return Conditions</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>
                    Wheels must be unused, in original packaging, and in the same condition as
                    received
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>
                    All original packaging materials, center caps, and accessories must be
                    included
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>
                    Return authorization must be obtained before shipping items back
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Return Process</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 font-semibold text-slate-900">1.</span>
                  <span>Contact us with your order number and reason for return</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 font-semibold text-slate-900">2.</span>
                  <span>We provide a return authorization and shipping label</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 font-semibold text-slate-900">3.</span>
                  <span>Ship to our Vancouver return hub (we cover return shipping for verified issues)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 font-semibold text-slate-900">4.</span>
                  <span>We inspect and process refund or replacement within 5-7 business days</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* 保修信息 */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">Warranty Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Manufacturer Warranty</h3>
              <p className="text-sm text-slate-600">
                All wheels come with manufacturer warranty coverage. Warranty terms vary by brand
                and typically cover manufacturing defects and structural issues under normal use
                conditions.
              </p>
              <p className="text-sm text-slate-600">
                We facilitate warranty claims through our network. If you encounter a
                manufacturer defect, contact us with photos and details, and we&apos;ll coordinate
                with the manufacturer on your behalf.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">What&apos;s Covered</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>Manufacturing defects (cracks, structural issues)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>Finish defects (peeling, discoloration under normal use)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>Shipping damage (covered by our insurance)</span>
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-slate-900">What&apos;s Not Covered</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>Damage from accidents, curb strikes, or improper installation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>Wear from track use or aggressive driving (varies by brand)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-slate-400">•</span>
                  <span>Modifications or alterations to the wheels</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">
                How long do I have to report shipping damage?
              </summary>
              <p className="mt-3 text-sm text-slate-600">
                Please inspect your wheels immediately upon delivery and report any shipping damage
                within 7 days. Take photos before removing packaging if possible. This helps us
                process your claim quickly.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">
                What if the wheels don&apos;t fit my car?
              </summary>
              <p className="mt-3 text-sm text-slate-600">
                We perform a pre-fitment check before shipping, but if there&apos;s still a fitment
                issue, contact us immediately. We&apos;ll work with you to find a solution — whether
                that&apos;s a different size, offset adjustment, or full return. Fitment issues are
                our priority to resolve.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">
                Do I pay for return shipping?
              </summary>
              <p className="mt-3 text-sm text-slate-600">
                For verified shipping damage, defects, or our error (wrong item), we cover return
                shipping costs. For fitment issues that couldn&apos;t be resolved pre-shipment, we
                also cover return shipping. For other returns, standard return shipping applies.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">
                How long does a return or replacement take?
              </summary>
              <p className="mt-3 text-sm text-slate-600">
                Once we receive your return at our Vancouver hub, we inspect within 24-48 hours.
                Refunds are processed within 5-7 business days. Replacements ship within 7-10
                business days after verification, depending on stock availability.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">
                Can I return wheels that have been installed?
              </summary>
              <p className="mt-3 text-sm text-slate-600">
                Wheels must be unused and in original packaging for standard returns. However, if
                there&apos;s a fitment issue discovered during installation, contact us
                immediately. We may be able to work out a solution depending on the circumstances.
              </p>
            </details>

            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">
                What if I receive the wrong wheels?
              </summary>
              <p className="mt-3 text-sm text-slate-600">
                Contact us immediately with your order number and photos. We&apos;ll arrange for
                the correct wheels to be shipped and cover all return shipping costs for the wrong
                item. This is our error, and we make it right at no cost to you.
              </p>
            </details>
          </div>
        </div>

        {/* 联系方式 */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white shadow-lg md:p-12">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold md:text-3xl">Need Help?</h2>
            <p className="text-slate-300 md:text-lg">
              Our support team is here to help with any questions or issues.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-1 font-semibold">Email Support</h3>
              <p className="text-sm text-slate-300">support@rimsurge.com</p>
              <p className="mt-1 text-xs text-slate-400">Response within 24-48 hours</p>
            </div>

            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-1 font-semibold">Live Chat</h3>
              <p className="text-sm text-slate-300">Available during business hours</p>
              <p className="mt-1 text-xs text-slate-400">Mon-Fri, 9 AM - 5 PM PST</p>
            </div>

            <div className="text-center">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-1 font-semibold">Return Hub</h3>
              <p className="text-sm text-slate-300">Vancouver, BC</p>
              <p className="mt-1 text-xs text-slate-400">Local returns & replacements</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Contact Us
            </Link>
            <Link
              href="/shop/all"
              className="inline-flex items-center justify-center rounded-full border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Browse Wheels
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

