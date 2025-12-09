// app/(app)/privacy/page.tsx

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Rimsurge',
  description: 'Privacy Policy for Rimsurge · 东街车房 - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  const lastUpdated = 'December 10, 2024'

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-12">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Privacy Policy
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
              At Rimsurge · 东街车房 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to
              protecting your privacy. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you visit our website and use our services
              (collectively, the &quot;Service&quot;).
            </p>
          </div>

          {/* 1. Information We Collect */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              1. Information We Collect
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-slate-600 md:text-base">
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Personal Information</h3>
                <p className="mb-2">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>Name, email address, phone number, and mailing address</li>
                  <li>Payment information (processed securely through third-party processors)</li>
                  <li>Vehicle information for fitment purposes</li>
                  <li>Account credentials and preferences</li>
                  <li>Communications with our customer service team</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-slate-900">Automatically Collected Information</h3>
                <p className="mb-2">
                  When you visit our Service, we automatically collect certain information, including:
                </p>
                <ul className="ml-6 list-disc space-y-1">
                  <li>IP address and browser type</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website addresses</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. How We Use Your Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              2. How We Use Your Information
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>We use the information we collect to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Provide customer service and support</li>
                <li>Perform fitment checks and verify compatibility</li>
                <li>Send order confirmations, shipping updates, and invoices</li>
                <li>Communicate with you about products, services, and promotions</li>
                <li>Improve our Service and develop new features</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </div>

          {/* 3. Information Sharing and Disclosure */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              3. Information Sharing and Disclosure
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
              <div>
                <h3 className="mb-2 mt-4 font-semibold text-slate-900">Service Providers</h3>
                <p>
                  We share information with third-party service providers who perform services on our
                  behalf, such as payment processing, shipping, data analytics, and customer support.
                </p>
              </div>
              <div>
                <h3 className="mb-2 mt-4 font-semibold text-slate-900">Legal Requirements</h3>
                <p>
                  We may disclose your information if required by law or in response to valid requests
                  by public authorities.
                </p>
              </div>
              <div>
                <h3 className="mb-2 mt-4 font-semibold text-slate-900">Business Transfers</h3>
                <p>
                  In the event of a merger, acquisition, or sale of assets, your information may be
                  transferred as part of that transaction.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Cookies and Tracking Technologies */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              4. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                We use cookies and similar tracking technologies to track activity on our Service and
                hold certain information. Cookies are files with a small amount of data that may
                include an anonymous unique identifier.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is
                being sent. However, if you do not accept cookies, you may not be able to use some
                portions of our Service.
              </p>
              <p>
                We use cookies for purposes such as:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Remembering your preferences and settings</li>
                <li>Analyzing how you use our Service</li>
                <li>Providing personalized content and advertisements</li>
                <li>Improving security and preventing fraud</li>
              </ul>
            </div>
          </div>

          {/* 5. Data Security */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              5. Data Security
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                We implement appropriate technical and organizational security measures to protect
                your personal information against unauthorized access, alteration, disclosure, or
                destruction. These measures include:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>SSL encryption for data transmission</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication procedures</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100%
                secure. While we strive to use commercially acceptable means to protect your
                information, we cannot guarantee absolute security.
              </p>
            </div>
          </div>

          {/* 6. Your Rights and Choices */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              6. Your Rights and Choices
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>You have certain rights regarding your personal information:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Access:</strong> You can request access to your personal information
                </li>
                <li>
                  <strong>Correction:</strong> You can request correction of inaccurate information
                </li>
                <li>
                  <strong>Deletion:</strong> You can request deletion of your personal information,
                  subject to legal obligations
                </li>
                <li>
                  <strong>Opt-out:</strong> You can opt-out of marketing communications by clicking
                  unsubscribe links or contacting us
                </li>
                <li>
                  <strong>Cookie Preferences:</strong> You can manage cookie preferences through your
                  browser settings
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{' '}
                <a href="mailto:support@rimsurge.com" className="font-semibold text-slate-900 underline hover:text-slate-700">
                  support@rimsurge.com
                </a>
                .
              </p>
            </div>
          </div>

          {/* 7. Data Retention */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              7. Data Retention
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this Privacy Policy, unless a longer retention period is required or
              permitted by law. When we no longer need your information, we will securely delete or
              anonymize it.
            </p>
          </div>

          {/* 8. Children&apos;s Privacy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              Our Service is not intended for individuals under the age of 18. We do not knowingly
              collect personal information from children. If you become aware that a child has
              provided us with personal information, please contact us immediately, and we will take
              steps to delete such information.
            </p>
          </div>

          {/* 9. International Data Transfers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              9. International Data Transfers
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              Your information may be transferred to and processed in countries other than Canada,
              including Japan, Taiwan, and China, where our suppliers and service providers are
              located. We ensure that appropriate safeguards are in place to protect your information
              in accordance with this Privacy Policy and applicable data protection laws.
            </p>
          </div>

          {/* 10. Changes to This Privacy Policy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-sm leading-relaxed text-slate-600 md:text-base">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new Privacy Policy on this page and updating the
              &quot;Last updated&quot; date. We encourage you to review this Privacy Policy
              periodically for any changes.
            </p>
          </div>

          {/* 11. Contact Us */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              11. Contact Us
            </h2>
            <p className="mb-3 text-sm leading-relaxed text-slate-600 md:text-base">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Email:</span>{' '}
                <a href="mailto:support@rimsurge.com" className="underline hover:text-slate-700">
                  support@rimsurge.com
                </a>
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

