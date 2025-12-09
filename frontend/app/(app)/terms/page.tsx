// app/(app)/terms/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Rimsurge',
  description: 'Terms of Service for Rimsurge · 东街车房 - Read our terms and conditions for using our services.',
}

export default function TermsPage() {
  const lastUpdated = 'December 10, 2024'

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-12">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* 内容区域 */}
        <div className="space-y-8">
          {/* 简介 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              Welcome to Rimsurge · 东街车房 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service
              (&quot;Terms&quot;) govern your access to and use of our website, products, and services
              (collectively, the &quot;Service&quot;). By accessing or using our Service, you agree to be bound by
              these Terms.
            </p>
          </div>

          {/* 1. Acceptance of Terms */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              1. Acceptance of Terms
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-slate-600 md:text-base">
              By accessing or using Rimsurge&apos;s website and services, you acknowledge that you have
              read, understood, and agree to be bound by these Terms and all applicable laws and
              regulations. If you do not agree with any part of these Terms, you must not use our
              Service.
            </p>
          </div>

          {/* 2. Use of Service */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              2. Use of Service
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                You may use our Service only for lawful purposes and in accordance with these Terms.
                You agree not to:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Use the Service in any way that violates any applicable federal, provincial, or local law or regulation</li>
                <li>Transmit any malicious code, viruses, or harmful data</li>
                <li>Attempt to gain unauthorized access to any portion of the Service</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Use automated systems to access the Service without our express written permission</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              </ul>
            </div>
          </div>

          {/* 3. Account Registration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              3. Account Registration
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                To access certain features of our Service, you may be required to create an account.
                You agree to:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </div>

          {/* 4. Products and Pricing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              4. Products and Pricing
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                We strive to provide accurate product descriptions, images, and pricing information.
                However, we do not warrant that product descriptions, images, or other content on our
                Service is accurate, complete, reliable, current, or error-free.
              </p>
              <p>
                All prices are in Canadian Dollars (CAD) unless otherwise stated. Prices include
                applicable taxes, duties, and brokerage fees for Canadian delivery. We reserve the
                right to change prices at any time without prior notice.
              </p>
              <p>
                Product availability is subject to change. We reserve the right to limit quantities
                and to refuse, limit, or cancel any orders at our sole discretion.
              </p>
            </div>
          </div>

          {/* 5. Orders and Payment */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              5. Orders and Payment
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                When you place an order through our Service, you are making an offer to purchase
                products subject to these Terms. We reserve the right to accept or reject your order
                for any reason.
              </p>
              <p>
                Payment must be received before we process and ship your order. We accept major
                credit cards, debit cards, and PayPal. All payments are processed securely through
                third-party payment processors.
              </p>
              <p>
                By providing payment information, you represent and warrant that you are authorized
                to use the payment method provided.
              </p>
            </div>
          </div>

          {/* 6. Shipping and Delivery */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              6. Shipping and Delivery
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                We offer shipping to addresses within Canada. Shipping costs and estimated delivery
                times are provided during checkout. Delivery times are estimates and not guaranteed.
              </p>
              <p>
                Risk of loss and title for products purchased from us pass to you upon delivery to
                the carrier. We are not responsible for delays caused by customs, weather, or other
                factors beyond our control.
              </p>
            </div>
          </div>

          {/* 7. Returns and Refunds */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              7. Returns and Refunds
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                Our return policy is detailed in our{' '}
                <Link href="/support" className="font-semibold text-slate-900 underline hover:text-slate-700">
                  Support & After-Sales
                </Link>{' '}
                page. Returns must be authorized by us before shipping. Products must be unused, in
                original packaging, and in the same condition as received.
              </p>
              <p>
                Refunds will be processed to the original payment method within 5-7 business days
                after we receive and inspect the returned products.
              </p>
            </div>
          </div>

          {/* 8. Fitment Guarantee */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              8. Fitment Guarantee
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                We perform pre-fitment checks before shipping to verify compatibility with your
                vehicle. However, final fitment is your responsibility. We recommend professional
                installation and verification.
              </p>
              <p>
                If fitment issues arise that could not be resolved through our pre-shipment review,
                contact us immediately. We will work with you to find a solution.
              </p>
            </div>
          </div>

          {/* 9. Intellectual Property */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              9. Intellectual Property
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                The Service and its original content, features, and functionality are owned by
                Rimsurge and are protected by international copyright, trademark, patent, trade
                secret, and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly
                display, publicly perform, republish, download, store, or transmit any of the
                material on our Service without our prior written consent.
              </p>
            </div>
          </div>

          {/* 10. Limitation of Liability */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              10. Limitation of Liability
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RIMSURGE SHALL NOT BE LIABLE FOR
                ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
                PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA,
                USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p>
                Our total liability to you for all claims arising from or related to the use of our
                Service shall not exceed the amount you paid to us in the twelve (12) months prior
                to the claim.
              </p>
            </div>
          </div>

          {/* 11. Indemnification */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              11. Indemnification
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              You agree to defend, indemnify, and hold harmless Rimsurge and its officers, directors,
              employees, and agents from and against any claims, liabilities, damages, losses, and
              expenses, including reasonable legal fees, arising out of or in any way connected with
              your access to or use of the Service or your violation of these Terms.
            </p>
          </div>

          {/* 12. Governing Law */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              12. Governing Law
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              These Terms shall be governed by and construed in accordance with the laws of the
              Province of British Columbia, Canada, without regard to its conflict of law provisions.
              Any disputes arising under or in connection with these Terms shall be subject to the
              exclusive jurisdiction of the courts of British Columbia.
            </p>
          </div>

          {/* 13. Changes to Terms */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              13. Changes to Terms
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              We reserve the right to modify these Terms at any time. We will notify users of any
              material changes by posting the new Terms on this page and updating the &quot;Last
              updated&quot; date. Your continued use of the Service after any changes constitutes
              acceptance of the new Terms.
            </p>
          </div>

          {/* 14. Contact Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              14. Contact Information
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-slate-600 md:text-base">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Email:</span> support@rimsurge.com
              </p>
              <p>
                <span className="font-semibold text-slate-900">Address:</span> Vancouver, BC, Canada
              </p>
            </div>
          </div>
        </div>

        {/* 返回链接 */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  )
}

