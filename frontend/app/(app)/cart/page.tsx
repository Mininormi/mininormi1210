// app/(app)/cart/page.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'

type CartItem = {
  id: string
  brand: string
  name: string
  size: string
  finish: string
  quantity: number
  pricePerWheel: number
  image?: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      brand: 'RAYS',
      name: 'Volk Racing TE37 Saga S-Plus',
      size: '18×8.5 +35',
      finish: 'Bronze',
      quantity: 4,
      pricePerWheel: 724.75,
    },
    {
      id: '2',
      brand: 'WedsSport',
      name: 'SA-25R Flow Form',
      size: '17×8.0 +35',
      finish: 'Matte Black',
      quantity: 4,
      pricePerWheel: 537.25,
    },
  ])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(
      cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    )
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.pricePerWheel * item.quantity,
    0
  )
  const shipping = subtotal > 0 ? 150 : 0 // 示例运费
  const tax = subtotal * 0.13 // 13% GST/HST (示例)
  const total = subtotal + shipping + tax

  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Shopping Cart
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* 空购物车 */
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <svg
              className="mx-auto h-16 w-16 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-slate-600">
              Start shopping to add items to your cart
            </p>
            <Link
              href="/shop/all"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-black"
            >
              Browse Wheels
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* 购物车商品列表 */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
                >
                  <div className="flex gap-4">
                    {/* 商品图片 */}
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 md:h-32 md:w-32">
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        Image
                      </div>
                    </div>

                    {/* 商品信息 */}
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.brand}
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-slate-900 md:text-base">
                            {item.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                            <span>Size: {item.size}</span>
                            <span>•</span>
                            <span>Finish: {item.finish}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex-shrink-0 text-slate-400 hover:text-slate-900"
                          aria-label="Remove item"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* 数量和价格 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <label htmlFor={`quantity-${item.id}`} className="text-xs text-slate-600">
                            Qty:
                          </label>
                          <div className="flex items-center gap-1 rounded-lg border border-slate-300">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                              disabled={item.quantity <= 1}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            ${(item.pricePerWheel * item.quantity).toFixed(2)} CAD
                          </p>
                          <p className="text-xs text-slate-500">
                            ${item.pricePerWheel.toFixed(2)} per wheel
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 订单摘要 */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">Order Summary</h2>
                <div className="space-y-3 border-b border-slate-200 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium text-slate-900">
                      ${subtotal.toFixed(2)} CAD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium text-slate-900">
                      {shipping > 0 ? `$${shipping.toFixed(2)} CAD` : 'Calculated at checkout'}
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
                <Link
                  href="/checkout"
                  className="mt-6 flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/30 transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop/all"
                  className="mt-3 flex w-full items-center justify-center rounded-full border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

