/*
 * \app\api\products\route.ts
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products

export async function GET() {
  const products = await prisma.product.findMany({
    include: { brand: true }, // 带出 brand，前端可以直接 brand.name
    orderBy: { name: 'asc' }, // 按名字排序，可选
  })

  return Response.json(products)
}

export async function POST(req: Request) {
  const data = await req.json()

  // 这里先写简单的直存，后面你想加校验再说
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      mainImage: data.mainImage,
      brandId: Number(data.brandId),
    },
  })

  return Response.json(product, { status: 201 })
}
