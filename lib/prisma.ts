/*
 * \lib\prisma.ts
 */

// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ['query', 'error', 'warn'], // 调试需要可以打开
  })

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
