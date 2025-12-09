// app/(app)/checkout/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CheckoutPage() {
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  })

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  })

  const orderItems = [
    {
      id: '1',
      name: 'RAYS Volk Racing TE37 Saga S-Plus',
      size: '18×8.5 +35',
      quantity: 4,
      price: 2899.0,
    },
    {
      id: '2',
      name: 'WedsSport SA-25R Flow Form',
      size: '17×8.0 +35',
      quantity: 4,
      price: 2149.0,
    },
  ]

  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0)
  const shipping = 150
  const tax = subtotal * 0.13
  const total = subtotal + shipping + tax

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 处理结账逻辑
  }

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Complete your order securely
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* 左侧表单区域 */}
          <div className="space-y-8">
            {/* 配送信息 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Shipping Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={shippingInfo.firstName}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={shippingInfo.lastName}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Street Address *
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, city: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
                <div>
                  <label htmlFor="province" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Province *
                  </label>
                  <select
                    id="province"
                    required
                    value={shippingInfo.province}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, province: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                  >
                    <option value="">Select Province</option>
                    <option value="AB">Alberta</option>
                    <option value="BC">British Columbia</option>
                    <option value="MB">Manitoba</option>
                    <option value="NB">New Brunswick</option>
                    <option value="NL">Newfoundland and Labrador</option>
                    <option value="NS">Nova Scotia</option>
                    <option value="ON">Ontario</option>
                    <option value="PE">Prince Edward Island</option>
                    <option value="QC">Quebec</option>
                    <option value="SK">Saskatchewan</option>
                    <option value="NT">Northwest Territories</option>
                    <option value="NU">Nunavut</option>
                    <option value="YT">Yukon</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="postalCode" className="mb-1.5 block text-sm font-semibold text-slate-900">
                    Postal Code *
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    required
                    value={shippingInfo.postalCode}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, postalCode: e.target.value.toUpperCase() })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                    placeholder="A1A 1A1"
                  />
                </div>
              </div>
            </div>

            {/* 账单信息 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billingSame"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="billingSame" className="text-sm font-semibold text-slate-900">
                  Billing address same as shipping address
                </label>
              </div>
              {!billingSameAsShipping && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                      Billing Address
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 支付方式 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-slate-200 p-4 transition hover:border-slate-300">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-slate-500">Visa</span>
                    <span className="text-xs text-slate-500">Mastercard</span>
                  </div>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-slate-200 p-4 transition hover:border-slate-300">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-900">PayPal</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardInfo.number}
                      onChange={(e) =>
                        setCardInfo({ ...cardInfo, number: e.target.value })
                      }
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardInfo.expiry}
                        onChange={(e) =>
                          setCardInfo({ ...cardInfo, expiry: e.target.value })
                        }
                        placeholder="MM/YY"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                        CVV *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardInfo.cvv}
                        onChange={(e) =>
                          setCardInfo({ ...cardInfo, cvv: e.target.value })
                        }
                        placeholder="123"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-900">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardInfo.name}
                      onChange={(e) =>
                        setCardInfo({ ...cardInfo, name: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-slate-900 focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧订单摘要 */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>
              <div className="space-y-3 border-b border-slate-200 pb-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="ml-4 font-medium text-slate-900">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-b border-slate-200 py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    ${subtotal.toFixed(2)} CAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-slate-900">
                    ${shipping.toFixed(2)} CAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (GST/HST)</span>
                  <span className="font-medium text-slate-900">
                    ${tax.toFixed(2)} CAD
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4">
                <span className="text-base font-semibold text-slate-900">Total</span>
                <span className="text-lg font-bold text-slate-900">
                  ${total.toFixed(2)} CAD
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Duties and brokerage included for Canadian delivery
              </p>
              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/30 transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Place Order
              </button>
              <Link
                href="/cart"
                className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Back to Cart
              </Link>
              <p className="mt-4 text-xs text-slate-500">
                By placing your order, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-slate-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-slate-700">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </form>
      </section>
    </div>
  )
}

