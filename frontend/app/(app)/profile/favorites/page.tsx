// app/(app)/profile/favorites/page.tsx
'use client'

export default function FavoritesPage() {
  // 模拟收藏数据（后续替换为 API）
  const favorites = [
    {
      id: 1,
      name: '轮毂 A',
      price: 649.50,
      image: '/placeholder-wheel.jpg',
      addedAt: '2025-01-01',
    },
    {
      id: 2,
      name: '轮毂 B',
      price: 899.00,
      image: '/placeholder-wheel.jpg',
      addedAt: '2024-12-30',
    },
    {
      id: 3,
      name: '轮毂 C',
      price: 1599.00,
      image: '/placeholder-wheel.jpg',
      addedAt: '2024-12-28',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-6">我的收藏</h2>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❤️</div>
            <p className="text-slate-600 mb-4">暂无收藏</p>
            <a href="/shop/all" className="text-sm text-slate-900 hover:underline">
              去逛逛 →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  <span className="text-5xl">🛞</span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-slate-900 mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-900">
                      ¥{item.price.toFixed(2)}
                    </span>
                    <button className="text-red-500 hover:text-red-600 text-sm">
                      取消收藏
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 px-4 py-2 text-sm font-medium text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                      查看详情
                    </button>
                    <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-black transition-colors">
                      加入购物车
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
