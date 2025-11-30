// app/api/products/[id]/route.ts
import { prisma } from '@/lib/prisma'

type ParamsPromise = Promise<{ id: string }>

// GET /api/products/:id
export async function GET(_req: Request, context: { params: ParamsPromise }) {
  const { id } = await context.params
  const numericId = Number(id)

  if (Number.isNaN(numericId)) {
    return Response.json({ message: 'Invalid id' }, { status: 400 })
  }

  const product = await prisma.product.findUnique({
    where: { id: numericId },
    include: { brand: true },
  })

  if (!product) {
    return Response.json({ message: 'Not found' }, { status: 404 })
  }

  return Response.json(product)
}

// ✅ PATCH /api/products/:id  —— refine 默认就用的这个
export async function PATCH(req: Request, context: { params: ParamsPromise }) {
  const { id } = await context.params
  const numericId = Number(id)

  if (Number.isNaN(numericId)) {
    return Response.json({ message: 'Invalid id' }, { status: 400 })
  }

  const data = await req.json()

  const product = await prisma.product.update({
    where: { id: numericId },
    data: {
      name: data.name,
      description: data.description,
      mainImage: data.mainImage,
      brandId: Number(data.brandId),
    },
  })

  return Response.json(product)
}

// PUT 你可以保留，也可以删掉，看你以后要不要手动调用
export async function PUT(req: Request, context: { params: ParamsPromise }) {
  const { id } = await context.params
  const numericId = Number(id)

  if (Number.isNaN(numericId)) {
    return Response.json({ message: 'Invalid id' }, { status: 400 })
  }

  const data = await req.json()

  const product = await prisma.product.update({
    where: { id: numericId },
    data: {
      name: data.name,
      description: data.description,
      mainImage: data.mainImage,
      brandId: Number(data.brandId),
    },
  })

  return Response.json(product)
}

// DELETE /api/products/:id
export async function DELETE(_req: Request, context: { params: ParamsPromise }) {
  const { id } = await context.params
  const numericId = Number(id)

  if (Number.isNaN(numericId)) {
    return Response.json({ message: 'Invalid id' }, { status: 400 })
  }

  await prisma.product.delete({
    where: { id: numericId },
  })

  return Response.json({ ok: true })
}
