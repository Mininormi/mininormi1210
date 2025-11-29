/*
 * \app\api\brands\route.ts
 */

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/brands  → 列出所有品牌
export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
  })
  return Response.json(brands)
}

// POST /api/brands → 新建品牌
export async function POST(req: NextRequest) {
  const body = await req.json()

  const name = String(body.name ?? '').trim()
  const slug = String(body.slug ?? '').trim()

  if (!name || !slug) {
    return new Response(JSON.stringify({ message: 'name 和 slug 必填' }), { status: 400 })
  }

  const brand = await prisma.brand.create({
    data: { name, slug },
  })

  return new Response(JSON.stringify(brand), { status: 201 })
}
